<?php
// services/StudentExamService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class StudentExamService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    private function getStudentData(int $userId): array
    {
        $student = $this->db->fetchOne("SELECT * FROM students WHERE user_id = ?", [$userId]);
        if (!$student) {
            Response::forbidden('بيانات الطالب غير مكتملة');
        }
        return $student;
    }

    /**
     * Get exams available for the student's class
     */
    public function getExams(int $userId, ?int $subjectId = null, ?string $scope = null): array
    {
        $student = $this->getStudentData($userId);

        $sql = "SELECT e.id, e.title, e.scope, e.scope_ref, e.duration, e.is_ai, s.name as subject_name 
                FROM exams e 
                JOIN subjects s ON e.subject_id = s.id 
                WHERE e.class_id = ?";
        $params = [$student['class_id']];

        if ($subjectId !== null) {
            $sql .= " AND e.subject_id = ?";
            $params[] = $subjectId;
        }

        if ($scope !== null) {
            $sql .= " AND e.scope = ?";
            $params[] = $scope;
        }

        $sql .= " ORDER BY e.created_at DESC";

        $exams = $this->db->fetchAll($sql, $params);

        // Map attempts status
        foreach ($exams as &$exam) {
            $attempt = $this->db->fetchOne(
                "SELECT status, percentage, total_score, max_score 
                 FROM exam_attempts 
                 WHERE exam_id = ? AND student_id = ? 
                 ORDER BY started_at DESC LIMIT 1",
                [$exam['id'], $student['id']]
            );
            $exam['attempt'] = $attempt ?: null;
        }

        return $exams;
    }

    /**
     * Start a new exam attempt or resume an in-progress one
     */
    public function startExamAttempt(int $userId, int $examId): array
    {
        $student = $this->getStudentData($userId);

        // Verify exam belongs to student's class
        $exam = $this->db->fetchOne("SELECT id, title, duration FROM exams WHERE id = ? AND class_id = ?", [$examId, $student['class_id']]);
        if (!$exam) {
            Response::forbidden('هذا الاختبار غير مخصص لصفك الدراسي');
        }

        // Check if there is an in-progress attempt
        $existing = $this->db->fetchOne(
            "SELECT id FROM exam_attempts WHERE exam_id = ? AND student_id = ? AND status = 'in_progress' LIMIT 1",
            [$examId, $student['id']]
        );

        if ($existing) {
            return [
                'attempt_id' => (int)$existing['id'],
                'message' => 'متابعة المحاولة الجارية',
                'exam_title' => $exam['title'],
                'duration' => (int)$exam['duration']
            ];
        }

        // Create new attempt
        $attemptId = $this->db->insert('exam_attempts', [
            'exam_id' => $examId,
            'student_id' => $student['id'],
            'started_at' => date('Y-m-d H:i:s'),
            'status' => 'in_progress'
        ]);

        return [
            'attempt_id' => $attemptId,
            'message' => 'تم بدء المحاولة بنجاح',
            'exam_title' => $exam['title'],
            'duration' => (int)$exam['duration']
        ];
    }

    /**
     * Get details of an attempt (questions and current answers) without correct answers
     */
    public function getExamAttemptDetails(int $userId, int $attemptId): array
    {
        $student = $this->getStudentData($userId);

        // Verify attempt ownership
        $attempt = $this->db->fetchOne(
            "SELECT a.id, a.exam_id, a.started_at, a.status, e.title, e.duration 
             FROM exam_attempts a 
             JOIN exams e ON a.exam_id = e.id 
             WHERE a.id = ? AND a.student_id = ?",
            [$attemptId, $student['id']]
        );

        if (!$attempt) {
            Response::forbidden('المحاولة غير موجودة أو غير مصرح لك بعرضها');
        }

        // Fetch questions without answer column
        $questions = $this->db->fetchAll(
            "SELECT id, question, type, options, score, order_num 
             FROM exam_questions 
             WHERE exam_id = ? 
             ORDER BY order_num ASC",
            [$attempt['exam_id']]
        );

        foreach ($questions as &$q) {
            if ($q['options']) {
                $q['options'] = json_decode($q['options'], true);
            }
        }

        // Fetch student's current saved answers
        $answers = $this->db->fetchAll(
            "SELECT question_id, answer FROM exam_answers WHERE attempt_id = ?",
            [$attemptId]
        );

        $answersIndexed = [];
        foreach ($answers as $ans) {
            $answersIndexed[$ans['question_id']] = $ans['answer'];
        }

        return [
            'attempt' => $attempt,
            'questions' => $questions,
            'answers' => $answersIndexed
        ];
    }

    /**
     * Save an answer for a specific question
     */
    public function saveQuestionAnswer(int $userId, int $attemptId, int $questionId, string $answer): void
    {
        $student = $this->getStudentData($userId);

        // Verify attempt ownership and state
        $attempt = $this->db->fetchOne(
            "SELECT id, exam_id, status FROM exam_attempts WHERE id = ? AND student_id = ?",
            [$attemptId, $student['id']]
        );

        if (!$attempt) {
            Response::forbidden('المحاولة غير موجودة');
        }

        if ($attempt['status'] !== 'in_progress') {
            Response::error('لا يمكن تعديل الإجابات بعد تسليم الاختبار', 422);
        }

        // Verify question belongs to this exam
        $q = $this->db->fetchOne(
            "SELECT id FROM exam_questions WHERE id = ? AND exam_id = ?",
            [$questionId, $attempt['exam_id']]
        );

        if (!$q) {
            Response::error('هذا السؤال غير مرتبط بالاختبار الحالي', 422);
        }

        // Insert or update answer
        $existing = $this->db->fetchOne(
            "SELECT id FROM exam_answers WHERE attempt_id = ? AND question_id = ? LIMIT 1",
            [$attemptId, $questionId]
        );

        if ($existing) {
            $this->db->update(
                'exam_answers',
                ['answer' => $answer],
                ['id' => (int)$existing['id']]
            );
        } else {
            $this->db->insert('exam_answers', [
                'attempt_id' => $attemptId,
                'question_id' => $questionId,
                'answer' => $answer
            ]);
        }
    }

    /**
     * Submit and grade the attempt
     */
    public function submitExamAttempt(int $userId, int $attemptId): array
    {
        $student = $this->getStudentData($userId);

        // Verify attempt ownership
        $attempt = $this->db->fetchOne(
            "SELECT id, exam_id, status FROM exam_attempts WHERE id = ? AND student_id = ?",
            [$attemptId, $student['id']]
        );

        if (!$attempt) {
            Response::forbidden('المحاولة غير موجودة');
        }

        if ($attempt['status'] !== 'in_progress') {
            Response::error('تم تسليم هذا الاختبار مسبقاً', 422);
        }

        // Fetch questions
        $questions = $this->db->fetchAll(
            "SELECT id, question, type, answer, score FROM exam_questions WHERE exam_id = ?",
            [$attempt['exam_id']]
        );

        // Fetch saved answers
        $savedAnswers = $this->db->fetchAll(
            "SELECT question_id, answer FROM exam_answers WHERE attempt_id = ?",
            [$attemptId]
        );

        $answersIndexed = [];
        foreach ($savedAnswers as $sa) {
            $answersIndexed[$sa['question_id']] = $sa['answer'];
        }

        $totalScore = 0.0;
        $maxPossibleScore = 0.0;
        $correctCount = 0;

        $aiService = new AIService();

        return $this->db->transaction(function() use ($attemptId, $questions, $answersIndexed, $aiService, &$totalScore, &$maxPossibleScore, &$correctCount) {
            foreach ($questions as $q) {
                $qId = (int)$q['id'];
                $qType = $q['type'];
                $correctAnswer = trim($q['answer']);
                $studentAnswer = isset($answersIndexed[$qId]) ? trim($answersIndexed[$qId]) : '';
                $qScore = (float)$q['score'];
                $maxPossibleScore += $qScore;

                // Ensure answer record exists
                $ansRecord = $this->db->fetchOne(
                    "SELECT id FROM exam_answers WHERE attempt_id = ? AND question_id = ? LIMIT 1",
                    [$attemptId, $qId]
                );
                
                if (!$ansRecord) {
                    $ansId = $this->db->insert('exam_answers', [
                        'attempt_id' => $attemptId,
                        'question_id' => $qId,
                        'answer' => $studentAnswer
                    ]);
                } else {
                    $ansId = (int)$ansRecord['id'];
                }

                if ($qType === 'mcq' || $qType === 'true_false') {
                    // Direct evaluation
                    $isCorrect = (utf8_compare($studentAnswer, $correctAnswer));
                    $score = $isCorrect ? $qScore : 0.0;
                    if ($isCorrect) {
                        $correctCount++;
                    }

                    $this->db->update('exam_answers', [
                        'is_correct' => $isCorrect ? 1 : 0,
                        'score' => $score,
                        'ai_feedback' => 'تصحيح تلقائي مباشر.'
                    ], ['id' => $ansId]);

                    $totalScore += $score;
                } else {
                    // Grading short_answer and essay via AIService
                    $gradeResult = $aiService->gradeShortAnswer(
                        $attemptId,
                        $qId,
                        $studentAnswer,
                        $correctAnswer,
                        $qType,
                        $qScore
                    );

                    $isCorrect = (bool)($gradeResult['is_correct'] ?? false);
                    $score = (float)($gradeResult['score'] ?? 0.0);
                    if ($isCorrect || $score >= ($qScore * 0.5)) {
                        $correctCount++;
                    }

                    $this->db->update('exam_answers', [
                        'is_correct' => $isCorrect ? 1 : 0,
                        'score' => $score,
                        'ai_feedback' => $gradeResult['ai_feedback'] ?? 'تم التصحيح بواسطة الذكاء الاصطناعي.'
                    ], ['id' => $ansId]);

                    $totalScore += $score;
                }
            }

            $percentage = $maxPossibleScore > 0 ? ($totalScore / $maxPossibleScore * 100) : 0.0;
            $aiReport = [
                'correct_questions' => $correctCount,
                'total_questions' => count($questions),
                'feedback' => $percentage >= 50 ? 'لقد اجتزت الاختبار بنجاح، أحسنت!' : 'تحتاج لمراجعة أعمق للمادة وإعادة التركيز.'
            ];

            // Update Attempt status to graded
            $this->db->update('exam_attempts', [
                'submitted_at' => date('Y-m-d H:i:s'),
                'total_score' => $totalScore,
                'max_score' => $maxPossibleScore,
                'percentage' => $percentage,
                'status' => 'graded',
                'ai_report' => json_encode($aiReport)
            ], ['id' => $attemptId]);

            return [
                'attempt_id' => $attemptId,
                'total_score' => $totalScore,
                'max_score' => $maxPossibleScore,
                'percentage' => round($percentage, 2),
                'report' => $aiReport
            ];
        });
    }

    /**
     * Get attempt results (answers, correctness, score and feedback)
     */
    public function getExamAttemptResult(int $userId, int $attemptId): array
    {
        $student = $this->getStudentData($userId);

        // Verify attempt ownership and state
        $attempt = $this->db->fetchOne(
            "SELECT a.id, a.exam_id, a.started_at, a.submitted_at, a.total_score, a.max_score, a.percentage, a.status, a.ai_report, e.title 
             FROM exam_attempts a 
             JOIN exams e ON a.exam_id = e.id 
             WHERE a.id = ? AND a.student_id = ?",
            [$attemptId, $student['id']]
        );

        if (!$attempt) {
            Response::forbidden('المحاولة غير موجودة');
        }

        if ($attempt['status'] !== 'graded') {
            Response::error('هذا الاختبار لم يتم تصحيحه أو تسليمه بعد', 422);
        }

        // Fetch questions and answers
        $questions = $this->db->fetchAll(
            "SELECT q.id, q.question, q.type, q.options, q.score as max_score, q.answer as correct_answer, 
                    ans.answer as student_answer, ans.is_correct, ans.score as student_score, ans.ai_feedback
             FROM exam_questions q
             LEFT JOIN exam_answers ans ON ans.question_id = q.id AND ans.attempt_id = ?
             WHERE q.exam_id = ?
             ORDER BY q.order_num ASC",
            [$attemptId, $attempt['exam_id']]
        );

        foreach ($questions as &$q) {
            if ($q['options']) {
                $q['options'] = json_decode($q['options'], true);
            }
        }

        return [
            'attempt' => [
                'id' => $attempt['id'],
                'exam_title' => $attempt['title'],
                'started_at' => $attempt['started_at'],
                'submitted_at' => $attempt['submitted_at'],
                'total_score' => $attempt['total_score'],
                'max_score' => $attempt['max_score'],
                'percentage' => $attempt['percentage'],
                'report' => json_decode($attempt['ai_report'] ?? '[]', true)
            ],
            'questions' => $questions
        ];
    }
}

// Case insensitive or trimmed comparison for Arabic
function utf8_compare(string $str1, string $str2): bool {
    $s1 = preg_replace('/\s+/', '', str_replace(['أ','إ','آ'], 'ا', trim($str1)));
    $s2 = preg_replace('/\s+/', '', str_replace(['أ','إ','آ'], 'ا', trim($str2)));
    return strcasecmp($s1, $s2) === 0;
}

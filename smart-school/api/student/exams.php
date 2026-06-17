<?php
// api/student/exams.php

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\StudentExamService;
use Services\AIService;

/** @var \Core\Request $req */

$method = $req->method();
$examService = new StudentExamService();
$currentUser = Auth::user($req);

switch ($method) {
    case 'GET':
        $attemptId = $req->param('id');
        
        if ($attemptId) {
            $action = $req->query('action') ?: 'details';
            
            if ($action === 'result') {
                $result = $examService->getExamAttemptResult($currentUser['id'], (int)$attemptId);
                Response::success($result);
            } else {
                $details = $examService->getExamAttemptDetails($currentUser['id'], (int)$attemptId);
                Response::success($details);
            }
        } else {
            // List exams
            $subjectId = $req->query('subject_id') ? (int)$req->query('subject_id') : null;
            $scope = $req->query('scope') ?: null;
            
            $exams = $examService->getExams($currentUser['id'], $subjectId, $scope);
            Response::success($exams);
        }
        break;

    case 'POST':
        $paramId = $req->param('id');
        
        if ($paramId) {
            $action = $req->query('action') ?: 'answer';
            
            if ($action === 'submit') {
                $result = $examService->submitExamAttempt($currentUser['id'], (int)$paramId);
                Response::success($result, 'تم تسليم وتصحيح الاختبار بنجاح');
            } else {
                // save answer
                $v = Validator::make($req->all(), [
                    'question_id' => 'required|integer',
                    'answer'      => 'required|string'
                ]);
                $v->failAndRespond();
                
                $data = $v->validated();
                $examService->saveQuestionAnswer(
                    $currentUser['id'],
                    (int)$paramId,
                    (int)$data['question_id'],
                    $data['answer']
                );
                Response::success(null, 'تم حفظ الإجابة بنجاح');
            }
        } else {
            // start new exam attempt (with optional AI generation)
            $v = Validator::make($req->all(), [
                'subject_id'     => 'required|integer',
                'scope'          => 'required|in:topic,unit,term,full_book',
                'scope_ref'      => 'string',
                'question_count' => 'integer'
            ]);
            $v->failAndRespond();
            
            $data = $v->validated();
            $questionCount = $data['question_count'] ?? 10;
            
            // Get student info
            $db = \Core\Database::getInstance();
            $student = $db->fetchOne("SELECT id, class_id FROM students WHERE user_id = ?", [$currentUser['id']]);
            if (!$student) {
                Response::forbidden('بيانات الطالب غير مكتملة');
            }
            
            // Generate exam via AI
            $aiService = new AIService();
            $examTitle = "اختبار ذكي - مادة " . $data['scope_ref'];
            
            $examId = $aiService->generateAIExam(
                (int)$data['subject_id'],
                (int)$student['class_id'],
                $examTitle,
                $data['scope'],
                $data['scope_ref'] ?? '',
                (int)$questionCount,
                (int)$currentUser['id']
            );
            
            // Start attempt
            $attempt = $examService->startExamAttempt($currentUser['id'], $examId);
            Response::success($attempt, 'تم إنشاء الاختبار والبدء بنجاح', 201);
        }
        break;

    default:
        Response::error('Method Not Allowed', 405);
}

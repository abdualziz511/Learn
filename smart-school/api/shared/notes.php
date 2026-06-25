<?php
// api/shared/notes.php
// Shared handler for sheet_notes — used by both teacher & parent roles

use Core\Response;
use Core\Auth;
use Core\Database;

/** @var \Core\Request $req */

$db          = Database::getInstance();
$currentUser = Auth::user($req);
$userId      = (int)$currentUser['id'];
$role        = $currentUser['role'];          // 'teacher' | 'parent' | 'student'
$noteType    = ($role === 'parent') ? 'parent' : (($role === 'student') ? 'student' : 'teacher');
$method      = $req->method();

// Security: If student, they can only view, and only their own notes
if ($role === 'student') {
    if ($method === 'POST') {
        Response::error('لا تملك صلاحية لإضافة ملاحظات', 403);
    }
    
    // Crucial Fix: Fetch the real student_id from students table using the user_id
    $studentRow = $db->fetchOne("SELECT id FROM students WHERE user_id = ?", [$userId]);
    if (!$studentRow) {
        Response::error('لم يتم العثور على سجل طالب مرابط لهذا المستخدم', 404);
    }
    
    $_GET['student_id'] = (int)$studentRow['id']; 
}

// ── GET: fetch existing note ───────────────────────────────────────
if ($method === 'GET') {
    $studentId = (int)($_GET['student_id'] ?? 0);
    $subjectId = (int)($_GET['subject_id'] ?? 0);
    $month     = (int)($_GET['month'] ?? 0);
    $year      = (int)($_GET['year']  ?? 0);

    // Fallback to current if zero
    if (!$month) $month = (int)date('n');
    if (!$year)  $year  = (int)date('Y');
    // Allow fetching any type if specified (parent or teacher) explicitly in GET
    // If not specified, use the user's default role type
    $fetchType = $_GET['type'] ?? $noteType; 

    if (!$studentId || !$subjectId) {
        Response::error('student_id و subject_id مطلوبان', 400);
    }

    $row = $db->fetchOne(
        "SELECT note, updated_at FROM sheet_notes
         WHERE student_id = ? AND subject_id = ? AND month = ? AND year = ? AND note_type = ?",
        [$studentId, $subjectId, $month, $year, $fetchType]
    );

    Response::success([
        'note'       => $row ? $row['note'] : '',
        'updated_at' => $row ? $row['updated_at'] : null,
    ]);
}

// ── POST: save / update note ───────────────────────────────────────
if ($method === 'POST') {
    $data      = json_decode(file_get_contents('php://input'), true) ?? [];
    $studentId = (int)($data['student_id'] ?? 0);
    $subjectId = (int)($data['subject_id'] ?? 0);
    $month     = (int)($data['month']      ?? date('n'));
    $year      = (int)($data['year']       ?? date('Y'));
    $note      = trim((string)($data['note'] ?? ''));

    if (!$studentId || !$subjectId) {
        Response::error('student_id و subject_id مطلوبان', 400);
    }

    // Upsert — insert or update on duplicate key
    $db->query(
        "INSERT INTO sheet_notes (student_id, subject_id, month, year, note_type, note, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE note = VALUES(note), updated_by = VALUES(updated_by)",
        [$studentId, $subjectId, $month, $year, $noteType, $note, $userId]
    );

    Response::success(['message' => 'تم حفظ الملاحظة بنجاح']);
}

Response::error('Method Not Allowed', 405);

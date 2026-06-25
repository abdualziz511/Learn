<?php
// index.php
// Main Entry Point

declare(strict_types=1);

// 1. Absolute First: Handle CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");

// 2. Handle OPTIONS preflight immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 3. Set Content Type & Error Reporting
header("Content-Type: application/json; charset=UTF-8");
mb_internal_encoding("UTF-8");
mb_http_output("UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', '1');

use Core\Request;
use Core\Response;
use Core\Router;
use Middleware\RateLimitMiddleware;
use Middleware\AuthMiddleware;
use Middleware\RoleMiddleware;

try {
    // 4. Basic autoloading for core classes
    spl_autoload_register(function ($class) {
        $class = str_replace('\\', '/', $class);
        $file = __DIR__ . '/' . lcfirst($class) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    });

    $appConfig = require __DIR__ . '/config/app.php';

$request = new Request();

// Global Middleware
(new RateLimitMiddleware())->handle($request);

$router = new Router();

// -------------------------------------------------------
// Route Registration
// -------------------------------------------------------

$router->group('/api', function (Router $api) {
    
    // Public routes (Auth)
    $api->group('/auth', function (Router $auth) {
        $auth->post('/login', function (Request $req) { require __DIR__ . '/api/auth/login.php'; }, [\Middleware\LoginLockoutMiddleware::class]);
        $auth->post('/refresh', function (Request $req) { require __DIR__ . '/api/auth/refresh.php'; });
        $auth->post('/logout', function (Request $req) { require __DIR__ . '/api/auth/logout.php'; });
    });

    // Global Notifications
    $api->group('/notifications', function (Router $n) {
        $n->get('', function (Request $req) {
            $user = \Core\Auth::user($req);
            $role = $user['role'] ?? 'unknown';
            // require __DIR__ . "/api/{$role}/notifications.php";
        });
    }, [AuthMiddleware::class]);

    // Student Routes
    $api->group('/student', function (Router $student) {
        $handlerDashboard = function(Request $req) { require __DIR__ . '/api/student/dashboard.php'; };
        $student->get('/dashboard', $handlerDashboard);

        $handlerSubjects = function(Request $req) { require __DIR__ . '/api/student/subjects.php'; };
        $student->get('/subjects', $handlerSubjects);
        $student->get('/subjects/{id}/content', $handlerSubjects);
        $student->get('/subjects/{id}/assignments', $handlerSubjects);

        $handlerGrades = function(Request $req) { require __DIR__ . '/api/student/grades.php'; };
        $student->get('/grades', $handlerGrades);
        $student->get('/attendance', $handlerGrades);

        $handlerExams = function(Request $req) { require __DIR__ . '/api/student/exams.php'; };
        $student->get('/exams', $handlerExams);
        $student->post('/exams/start', $handlerExams);
        $student->get('/exams/{id}', $handlerExams);
        $student->post('/exams/{id}', $handlerExams);

        $handlerNotifications = function(Request $req) { require __DIR__ . '/api/student/notifications.php'; };
        $student->get('/notifications', $handlerNotifications);

        $handlerNotes = function(Request $req) { require __DIR__ . '/api/shared/notes.php'; };
        $student->get('/notes', $handlerNotes);
    }, [AuthMiddleware::class, new RoleMiddleware('student')]);

    // Parent Routes
    $api->group('/parent', function (Router $parent) {
        $handlerChildren = function(Request $req) { require __DIR__ . '/api/parent/children.php'; };
        $parent->get('/children', $handlerChildren);
        $parent->get('/children/{id}/dashboard', $handlerChildren);
        $parent->get('/children/{id}/summary', $handlerChildren);
        $parent->get('/children/{id}/subjects', $handlerChildren);
        $parent->get('/children/{id}/subjects/{sid}/assignments', $handlerChildren);
        $parent->get('/children/{id}/grades', $handlerChildren);
        $parent->get('/children/{id}/attendance', $handlerChildren);
        $parent->post('/sign-assignment', $handlerChildren);

        $handlerNotes = function(Request $req) { require __DIR__ . '/api/shared/notes.php'; };
        $parent->get('/notes', $handlerNotes);
        $parent->post('/notes', $handlerNotes);

        $handlerNotifications = function(Request $req) { require __DIR__ . '/api/parent/notifications.php'; };
        $parent->get('/notifications', $handlerNotifications);

        $handlerReports = function(Request $req) { require __DIR__ . '/api/parent/reports.php'; };
        $parent->get('/reports', $handlerReports);
    }, [AuthMiddleware::class, new RoleMiddleware('parent')]);

    // Teacher Routes
    $api->group('/teacher', function (Router $teacher) {
        $handlerDashboard = function(Request $req) { require __DIR__ . '/api/teacher/dashboard.php'; };
        $teacher->get('/dashboard', $handlerDashboard);

        $handlerMeta = function(Request $req) { require __DIR__ . '/api/teacher/meta.php'; };
        $teacher->get('/meta', $handlerMeta);

        $handlerSchools = function(Request $req) { require __DIR__ . '/api/teacher/schools.php'; };
        $teacher->get('/schools', $handlerSchools);
        $teacher->get('/students', $handlerSchools); // Alias for convenience
        $teacher->get('/schools/{school_id}/classes', $handlerSchools);
        $teacher->get('/schools/{school_id}/classes/{class_id}/subjects', $handlerSchools);
        $teacher->get('/schools/{school_id}/classes/{class_id}/students', $handlerSchools);

        $handlerAttendance = function(Request $req) { require __DIR__ . '/api/teacher/attendance.php'; };
        $teacher->get('/attendance/schools', $handlerAttendance);
        $teacher->get('/attendance/grades', $handlerAttendance);
        $teacher->get('/attendance/classes', $handlerAttendance);
        $teacher->get('/attendance/subjects', $handlerAttendance);
        $teacher->get('/attendance', $handlerAttendance);
        $teacher->post('/assignments/add', function(Request $req) { require __DIR__ . '/api/teacher/assignments.php'; });
        $teacher->get('/monthly-stats', $handlerAttendance);
        $teacher->post('/attendance', $handlerAttendance);
        $teacher->post('/daily-followup', $handlerAttendance);

        $handlerNotes = function(Request $req) { require __DIR__ . '/api/shared/notes.php'; };
        $teacher->get('/notes', $handlerNotes);
        $teacher->post('/notes', $handlerNotes);

        $handlerGrades = function(Request $req) { require __DIR__ . '/api/teacher/grades.php'; };
        $teacher->get('/grades', $handlerGrades);
        $teacher->post('/grades', $handlerGrades);

        $handlerHomework = function(Request $req) { require __DIR__ . '/api/teacher/homework.php'; };
        $teacher->get('/homework', $handlerHomework);
        $teacher->post('/homework', $handlerHomework);
        $teacher->delete('/homework/{id}', $handlerHomework);

        // Add more teacher routes here later
    }, [AuthMiddleware::class, new RoleMiddleware('teacher')]);

    // School Admin Routes
    $api->group('/school-admin', function (Router $admin) {
        $admin->get('/school', function(Request $req) { require __DIR__ . '/api/school-admin/school.php'; });
        $admin->get('/stats', function(Request $req) { require __DIR__ . '/api/school-admin/stats.php'; });
        $admin->get('/grade-levels', function(Request $req) { require __DIR__ . '/api/school-admin/grade-levels.php'; });
        $classHandler = function(Request $req) { require __DIR__ . '/api/school-admin/classes.php'; };
        $admin->get('/classes', $classHandler);
        $admin->post('/classes', $classHandler);
        $admin->put('/classes/{id}', $classHandler);
        $admin->delete('/classes/{id}', $classHandler);

        $subjectHandler = function(Request $req) { require __DIR__ . '/api/school-admin/subjects.php'; };
        $admin->get('/subjects', $subjectHandler);
        $admin->post('/subjects', $subjectHandler);
        $admin->put('/subjects/{id}', $subjectHandler);
        $admin->delete('/subjects/{id}', $subjectHandler);

        $admin->get('/content', function(Request $req) { require __DIR__ . '/api/school-admin/content.php'; });

        $teacherHandler = function(Request $req) { require __DIR__ . '/api/school-admin/teachers.php'; };
        $admin->get('/teachers', $teacherHandler);
        $admin->get('/teachers/{id}', $teacherHandler);
        $admin->post('/teachers', $teacherHandler);
        $admin->put('/teachers/{id}', $teacherHandler);
        $admin->delete('/teachers/{id}', $teacherHandler);
        
        $studentHandler = function(Request $req) { require __DIR__ . '/api/school-admin/students.php'; };
        $admin->get('/students', $studentHandler);
        $admin->get('/students/{id}', $studentHandler);
        $admin->post('/students', $studentHandler);
        $admin->put('/students/{id}', $studentHandler);
        $admin->post('/students/bulk', $studentHandler);
        $admin->delete('/students/{id}', $studentHandler);
        $handlerReports = function(Request $req) { require __DIR__ . '/api/school-admin/reports.php'; };
        $admin->get('/reports/overview', $handlerReports);
        $admin->get('/reports/ai-insights', $handlerReports);

        $attendanceHandler = function(Request $req) { require __DIR__ . '/api/school-admin/attendance.php'; };
        $admin->get('/attendance', $attendanceHandler);
        $admin->patch('/attendance/{id}/approve', $attendanceHandler);

        $gradeHandler = function(Request $req) { require __DIR__ . '/api/school-admin/grades.php'; };
        $admin->get('/grades', $gradeHandler);
        $admin->patch('/grades/approve-all', $gradeHandler);

        $admin->get('/assignments', function(Request $req) { require __DIR__ . '/api/school-admin/teachers.php'; });
        $admin->post('/assignments', function(Request $req) { require __DIR__ . '/api/school-admin/teachers.php'; });
    }, [AuthMiddleware::class, new RoleMiddleware('school_admin', 'super_admin')]);

    // Super Admin Routes
    $api->group('/super-admin', function (Router $super) {
        $super->get('/stats', function (Request $req) { require __DIR__ . '/api/super-admin/stats.php'; });
        $handlerSchools = function(Request $req) { require __DIR__ . '/api/super-admin/schools.php'; };
        $super->get('/schools', $handlerSchools);
        $super->post('/schools', $handlerSchools);
        $super->put('/schools/{id}', $handlerSchools);
        $super->delete('/schools/{id}', $handlerSchools);

        $handlerUsers = function(Request $req) { require __DIR__ . '/api/super-admin/users.php'; };
        $super->get('/users', $handlerUsers);
        $super->get('/users/{id}', $handlerUsers);
        $super->post('/users', $handlerUsers);
        $super->put('/users/{id}', $handlerUsers);
        $super->delete('/users/{id}', $handlerUsers);

        $handlerSubjects = function(Request $req) { require __DIR__ . '/api/super-admin/subjects.php'; };
        $super->get('/subjects', $handlerSubjects);
        $super->get('/subjects/{id}', $handlerSubjects);
        $super->post('/subjects', $handlerSubjects);
        $super->put('/subjects/{id}', $handlerSubjects);
        $super->delete('/subjects/{id}', $handlerSubjects);

        $handlerContent = function(Request $req) { require __DIR__ . '/api/super-admin/content.php'; };
        $super->get('/content', $handlerContent);
        $super->get('/content/{id}', $handlerContent);
        $super->post('/content', $handlerContent);
        $super->delete('/content/{id}', $handlerContent);

        $handlerClasses = function(Request $req) { require __DIR__ . '/api/super-admin/classes.php'; };
        $super->get('/grades', $handlerClasses);
        $super->post('/grades', $handlerClasses);
        $super->put('/grades/{id}', $handlerClasses);
        $super->delete('/grades/{id}', $handlerClasses);
        
        $super->get('/classes', $handlerClasses);
        $super->post('/classes', $handlerClasses);
        $super->put('/classes/{id}', $handlerClasses);
        $super->delete('/classes/{id}', $handlerClasses);

        $handlerAI = function(Request $req) { require __DIR__ . '/api/super-admin/ai.php'; };
        $super->get('/ai/settings', $handlerAI);
        $super->put('/ai/settings', $handlerAI);
        $super->post('/ai/{id}', $handlerAI);

        $handlerSystem = function(Request $req) { require __DIR__ . '/api/super-admin/system.php'; };
        $super->get('/settings', $handlerSystem);
        $super->post('/settings', $handlerSystem);
        $super->get('/logs', $handlerSystem);
        $super->get('/backups', $handlerSystem);
        $super->post('/backups', $handlerSystem);
        $super->put('/backups', $handlerSystem);
        $super->delete('/backups', $handlerSystem);
    }, [AuthMiddleware::class, new RoleMiddleware('super_admin')]);

});

    $router->dispatch($request);

} catch (\Throwable $e) {
    $debug = $appConfig['debug'] ?? true;
    if ($debug) {
        Response::serverError($e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    } else {
        Response::serverError('حدث خطأ داخلي في الخادم');
    }
}

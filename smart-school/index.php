<?php
// index.php
// Main Entry Point

declare(strict_types=1);

// Basic autoloading for core classes
spl_autoload_register(function ($class) {
    $class = str_replace('\\', '/', $class);
    $file = __DIR__ . '/' . lcfirst($class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

use Core\Request;
use Core\Response;
use Core\Router;
use Middleware\RateLimitMiddleware;
use Middleware\AuthMiddleware;

// Handle CORS
$appConfig = require __DIR__ . '/config/app.php';
$cors = $appConfig['cors'];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array('*', $cors['allowed_origins']) || in_array($origin, $cors['allowed_origins'])) {
    header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
}
header("Access-Control-Allow-Methods: " . implode(', ', $cors['allowed_methods']));
header("Access-Control-Allow-Headers: " . implode(', ', $cors['allowed_headers']));
header("Access-Control-Max-Age: " . $cors['max_age']);

// Content Type JSON
header("Content-Type: application/json; charset=UTF-8");

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
        $auth->post('/login', function (Request $req) { require __DIR__ . '/api/auth/login.php'; });
        $auth->post('/refresh', function (Request $req) { require __DIR__ . '/api/auth/refresh.php'; });
        $auth->post('/logout', function (Request $req) { require __DIR__ . '/api/auth/logout.php'; });
    });

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
    }, [AuthMiddleware::class, new RoleMiddleware('student')]);

    // Parent Routes
    $api->group('/parent', function (Router $parent) {
        $handlerChildren = function(Request $req) { require __DIR__ . '/api/parent/children.php'; };
        $parent->get('/children', $handlerChildren);
        $parent->get('/children/{id}/dashboard', $handlerChildren);
        $parent->get('/children/{id}/grades', $handlerChildren);
        $parent->get('/children/{id}/attendance', $handlerChildren);

        // Add more parent routes here later
    }, [AuthMiddleware::class, new RoleMiddleware('parent')]);

    // Teacher Routes
    $api->group('/teacher', function (Router $teacher) {
        $handlerSchools = function(Request $req) { require __DIR__ . '/api/teacher/schools.php'; };
        $teacher->get('/schools', $handlerSchools);
        $teacher->get('/schools/{school_id}/classes', $handlerSchools);
        $teacher->get('/schools/{school_id}/classes/{class_id}/subjects', $handlerSchools);
        $teacher->get('/schools/{school_id}/classes/{class_id}/students', $handlerSchools);

        $handlerAttendance = function(Request $req) { require __DIR__ . '/api/teacher/attendance.php'; };
        $teacher->get('/attendance', $handlerAttendance);
        $teacher->post('/attendance', $handlerAttendance);

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
        $handlerSchool = function(Request $req) { require __DIR__ . '/api/school-admin/school.php'; };
        $admin->get('/school', $handlerSchool);
        $admin->put('/school', $handlerSchool);
        $admin->post('/school', $handlerSchool); // For logo

        $handlerStudents = function(Request $req) { require __DIR__ . '/api/school-admin/students.php'; };
        $admin->get('/students', $handlerStudents);
        $admin->get('/students/{id}', $handlerStudents);
        $admin->post('/students', $handlerStudents);
        $admin->put('/students/{id}', $handlerStudents);

        $handlerTeachers = function(Request $req) { require __DIR__ . '/api/school-admin/teachers.php'; };
        $admin->get('/teachers', $handlerTeachers);
        $admin->get('/teachers/{id}', $handlerTeachers);
        $admin->post('/teachers', $handlerTeachers);
        $admin->post('/teachers/{id}/assign', $handlerTeachers);
        $admin->delete('/teachers/{id}/assign/{assignment_id}', $handlerTeachers);

        $handlerAttendance = function(Request $req) { require __DIR__ . '/api/school-admin/attendance.php'; };
        $admin->get('/attendance', $handlerAttendance);
        $admin->patch('/attendance/{id}/approve', $handlerAttendance);
        $admin->patch('/attendance/{id}/reject', $handlerAttendance);

        $handlerGrades = function(Request $req) { require __DIR__ . '/api/school-admin/grades.php'; };
        $admin->get('/grades', $handlerGrades);
        $admin->patch('/grades/{id}/approve', $handlerGrades);
        $admin->patch('/grades/{id}/reject', $handlerGrades);

        $handlerReports = function(Request $req) { require __DIR__ . '/api/school-admin/reports.php'; };
        $admin->get('/reports/overview', $handlerReports);
        $admin->get('/reports/ai-insights', $handlerReports);

        // Add more admin routes here later
    }, [AuthMiddleware::class, new RoleMiddleware('school_admin', 'super_admin')]);

    // Super Admin Routes
    $api->group('/super-admin', function (Router $super) {
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
        $super->delete('/grades/{id}', $handlerClasses);
        
        $super->get('/classes', $handlerClasses);
        $super->post('/classes', $handlerClasses);
        $super->put('/classes/{id}', $handlerClasses);
        $super->delete('/classes/{id}', $handlerClasses);

        $handlerAI = function(Request $req) { require __DIR__ . '/api/super-admin/ai.php'; };
        $super->get('/ai/settings', $handlerAI);
        $super->put('/ai/settings', $handlerAI);
        $super->post('/ai/{id}', $handlerAI);
    }, [AuthMiddleware::class, new RoleMiddleware('super_admin')]);

});

// -------------------------------------------------------
// Dispatch Request
// -------------------------------------------------------
try {
    $router->dispatch($request);
} catch (\Throwable $e) {
    if ($appConfig['debug']) {
        Response::serverError($e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    } else {
        Response::serverError('حدث خطأ داخلي في الخادم');
    }
}

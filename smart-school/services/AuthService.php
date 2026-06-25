<?php
// services/AuthService.php
// Business logic for Authentication

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Auth;
use Core\Response;
use Services\SystemService;

class AuthService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function login(string $identifier, string $password): array
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        // 1. Fetch user (select lockout info too)
        $user = $this->db->fetchOne(
            "SELECT id, name, email, password_hash, role, is_active, failed_attempts, locked_until FROM users WHERE email = :id1 OR phone = :id2 LIMIT 1",
            ['id1' => $identifier, 'id2' => $identifier]
        );

        if (!$user) {
            $this->handleIpFailedAttempt($ip);
            Response::unauthorized('بيانات الدخول غير صحيحة');
        }

        // 2. Check if locked (Account level)
        if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
            $diff = strtotime($user['locked_until']) - time();
            $minutes = ceil($diff / 60);
            Response::forbidden("هذا الحساب مقفل مؤقتاً بسبب محاولات دخول فاشلة متكررة. يرجى المحاولة بعد {$minutes} دقيقة.");
        }

        // 3. Verify Password
        if (!password_verify($password, $user['password_hash'])) {
            $this->handleFailedAttempt($user);
            $this->handleIpFailedAttempt($ip);
            Response::unauthorized('بيانات الدخول غير صحيحة');
        }

        // 4. Success - Reset attempts (Account and IP)
        $this->db->update('users', ['failed_attempts' => 0, 'locked_until' => null, 'last_login' => date('Y-m-d H:i:s')], ['id' => $user['id']]);
        $this->db->query("DELETE FROM login_attempts WHERE ip_address = ?", [$ip]);

        // 5. Check Active status
        if (!$user['is_active']) {
            if ($user['role'] === 'school_admin') {
                Response::forbidden('حسابك موقف من قبل الإدارة العامة للنظام، يرجى التواصل معهم للاستفسار.');
            }
            Response::forbidden('الحساب غير مفعل حالياً');
        }

        // Get associated school IDs (except for super_admin and parent)
        $schoolIds = [];
        if ($user['role'] === 'school_admin') {
            $schools = $this->db->fetchAll("SELECT school_id FROM school_admins WHERE user_id = ?", [$user['id']]);
            $schoolIds = array_column($schools, 'school_id');
        } elseif ($user['role'] === 'teacher') {
            $schools = $this->db->fetchAll("SELECT DISTINCT school_id FROM teacher_assignments WHERE teacher_id = (SELECT id FROM teachers WHERE user_id = ?)", [$user['id']]);
            $schoolIds = array_column($schools, 'school_id');
        } elseif ($user['role'] === 'student') {
             $student = $this->db->fetchOne("SELECT school_id FROM students WHERE user_id = ?", [$user['id']]);
             if($student) $schoolIds[] = $student['school_id'];
        }

        // Generate tokens
        $payload = [
            'user_id'    => $user['id'],
            'role'       => $user['role'],
            'school_ids' => $schoolIds
        ];

        $accessToken = Auth::generateAccessToken($payload);
        $refreshToken = Auth::generateRefreshToken();

        // Store refresh token
        $this->db->insert('refresh_tokens', [
            'user_id'    => $user['id'],
            'token'      => $refreshToken,
            'expires_at' => date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60)) // 30 days
        ]);

        return [
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ],
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken
        ];
    }

    public function refresh(string $refreshToken): array
    {
        $row = $this->db->fetchOne(
            "SELECT r.*, u.role FROM refresh_tokens r JOIN users u ON r.user_id = u.id WHERE r.token = ? AND r.expires_at > NOW()",
            [$refreshToken]
        );

        if (!$row) {
            Response::unauthorized('Invalid or expired refresh token');
        }

        // Get school IDs
        $schoolIds = [];
        if ($row['role'] === 'school_admin') {
            $schools = $this->db->fetchAll("SELECT school_id FROM school_admins WHERE user_id = ?", [$row['user_id']]);
            $schoolIds = array_column($schools, 'school_id');
        } elseif ($row['role'] === 'teacher') {
            $schools = $this->db->fetchAll("SELECT DISTINCT school_id FROM teacher_assignments WHERE teacher_id = (SELECT id FROM teachers WHERE user_id = ?)", [$row['user_id']]);
            $schoolIds = array_column($schools, 'school_id');
        }

        $payload = [
            'user_id'    => $row['user_id'],
            'role'       => $row['role'],
            'school_ids' => $schoolIds
        ];

        $accessToken = Auth::generateAccessToken($payload);
        $newRefreshToken = Auth::generateRefreshToken();

        // Rotate refresh token
        $this->db->transaction(function(Database $db) use ($row, $newRefreshToken) {
             $db->delete('refresh_tokens', ['id' => $row['id']]);
             $db->insert('refresh_tokens', [
                'user_id'    => $row['user_id'],
                'token'      => $newRefreshToken,
                'expires_at' => date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60))
            ]);
        });

        return [
            'access_token' => $accessToken,
            'refresh_token' => $newRefreshToken
        ];
    }

    public function logout(string $refreshToken): void
    {
        $this->db->delete('refresh_tokens', ['token' => $refreshToken]);
        \Services\AuditService::getInstance()->log('LOGOUT', 'users');
    }

    private function handleFailedAttempt(array $user): void
    {
        $maxAttempts = (int)SystemService::getSetting('max_login_attempts', 5);
        $attempts = (int)$user['failed_attempts'] + 1;
        
        $updateData = ['failed_attempts' => $attempts];
        
        if ($attempts >= $maxAttempts) {
            // Lock logic: 10 mins for first time, then double each time
            $lockMultiplier = ($attempts - $maxAttempts) + 1;
            $lockMinutes = 10 * $lockMultiplier;
            $updateData['locked_until'] = date('Y-m-d H:i:s', time() + ($lockMinutes * 60));
        }

        $this->db->update('users', $updateData, ['id' => $user['id']]);
    }

    private function handleIpFailedAttempt(string $ip): void
    {
        $maxAttempts = (int)SystemService::getSetting('max_login_attempts', 5);
        
        $attempt = $this->db->fetchOne("SELECT attempts FROM login_attempts WHERE ip_address = ?", [$ip]);
        $count = $attempt ? (int)$attempt['attempts'] + 1 : 1;

        $lockedUntil = null;
        if ($count >= $maxAttempts) {
            $lockMultiplier = ($count - $maxAttempts) + 1;
            $lockMinutes = 10 * $lockMultiplier;
            $lockedUntil = date('Y-m-d H:i:s', time() + ($lockMinutes * 60));
        }

        $this->db->query(
            "INSERT INTO login_attempts (ip_address, attempts, locked_until) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE attempts = ?, locked_until = ?",
            [$ip, $count, $lockedUntil, $count, $lockedUntil]
        );
    }
}

<?php
// core/Auth.php
// JWT Authentication — pure PHP (no external library)

declare(strict_types=1);

namespace Core;

class Auth
{
    private static array $config = [];
    private static ?array $currentUser = null;

    // -------------------------------------------------------
    // Init config once
    // -------------------------------------------------------
    private static function config(): array
    {
        if (empty(self::$config)) {
            self::$config = require __DIR__ . '/../config/jwt.php';
        }
        return self::$config;
    }

    // -------------------------------------------------------
    // Generate Access Token (short-lived)
    // -------------------------------------------------------
    public static function generateAccessToken(array $payload): string
    {
        $config = self::config();
        $now    = time();

        $timeoutMinutes = \Services\SystemService::getSetting('session_timeout', 60);
        $ttl = (int)$timeoutMinutes * 60;

        $data = array_merge($payload, [
            'iss' => $config['issuer'],
            'iat' => $now,
            'exp' => $now + $ttl,
            'type'=> 'access',
        ]);

        return self::encode($data, $config['secret']);
    }

    // -------------------------------------------------------
    // Generate Refresh Token (long-lived random string)
    // -------------------------------------------------------
    public static function generateRefreshToken(): string
    {
        return bin2hex(random_bytes(64));
    }

    // -------------------------------------------------------
    // Verify & decode a JWT
    // -------------------------------------------------------
    public static function verify(string $token): array
    {
        $config = self::config();
        $payload = self::decode($token, $config['secret']);

        // Debug logging for 401 issues
        $logFile = __DIR__ . '/../storage/logs/auth_debug.log';
        $log = function($msg) use ($logFile) {
            file_put_contents($logFile, "[" . date('Y-m-d H:i:s') . "] " . $msg . PHP_EOL, FILE_APPEND);
        };

        if (!$payload) {
            $log("Token decode failed. Token starts with: " . substr($token, 0, 10));
            Response::unauthorized('Invalid token');
        }

        if (($payload['exp'] ?? 0) < time()) {
            $log("Token expired. Exp: " . ($payload['exp'] ?? 0) . " Now: " . time());
            Response::unauthorized('Token expired');
        }

        if (($payload['type'] ?? '') !== 'access') {
            $log("Invalid token type: " . ($payload['type'] ?? ''));
            Response::unauthorized('Invalid token type');
        }

        return $payload;
    }

    // -------------------------------------------------------
    // Get current authenticated user (cached per request)
    // -------------------------------------------------------
    public static function user(Request $request): array
    {
        if (self::$currentUser !== null) {
            return self::$currentUser;
        }

        $token = $request->bearerToken();
        $logFile = __DIR__ . '/../storage/logs/auth_debug.log';
        if (!$token) {
            $authHeader = $request->header('authorization', 'MISSING');
            file_put_contents($logFile, "[" . date('Y-m-d H:i:s') . "] No token provided. Header: " . substr($authHeader, 0, 20) . PHP_EOL, FILE_APPEND);
            Response::unauthorized('No token provided');
        }

        $payload = self::verify($token);

        // Load fresh user from DB
        $db   = Database::getInstance();
        $user = $db->fetchOne(
            "SELECT id, name, email, phone, role, avatar, is_active FROM users WHERE id = ?",
            [$payload['user_id']]
        );

        if (!$user) {
            Response::unauthorized('User not found');
        }

        if (!$user['is_active']) {
            Response::forbidden('Account is inactive');
        }

        // Attach token payload data
        $user['school_ids'] = $payload['school_ids'] ?? [];
        self::$currentUser  = $user;

        return $user;
    }

    public static function getCurrentUser(): ?array
    {
        return self::$currentUser;
    }

    // -------------------------------------------------------
    // Require specific role(s)
    // -------------------------------------------------------
    public static function requireRole(array $user, string|array $roles): void
    {
        $roles = (array)$roles;
        if (!in_array($user['role'], $roles, true)) {
            Response::forbidden('Access denied: insufficient permissions');
        }
    }

    // -------------------------------------------------------
    // Require user belongs to school
    // -------------------------------------------------------
    public static function requireSchool(array $user, int $schoolId): void
    {
        if ($user['role'] === 'super_admin') return; // super admin sees all

        if (!in_array($schoolId, $user['school_ids'], true)) {
            Response::forbidden('You do not have access to this school');
        }
    }

    // -------------------------------------------------------
    // JWT Encode
    // -------------------------------------------------------
    private static function encode(array $payload, string $secret): string
    {
        $header  = self::base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = self::base64url(json_encode($payload));
        $sig     = self::base64url(hash_hmac('sha256', "{$header}.{$payload}", $secret, true));
        return "{$header}.{$payload}.{$sig}";
    }

    // -------------------------------------------------------
    // JWT Decode
    // -------------------------------------------------------
    private static function decode(string $token, string $secret): array|false
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        [$header, $payload, $sig] = $parts;

        $expectedSig = self::base64url(
            hash_hmac('sha256', "{$header}.{$payload}", $secret, true)
        );

        // Constant-time comparison
        if (!hash_equals($expectedSig, $sig)) return false;

        $data = json_decode(self::base64urlDecode($payload), true);
        return is_array($data) ? $data : false;
    }

    private static function base64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64urlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}

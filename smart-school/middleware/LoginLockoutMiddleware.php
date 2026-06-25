<?php
// middleware/LoginLockoutMiddleware.php

declare(strict_types=1);

namespace Middleware;

use Core\Request;
use Core\Response;
use Core\Database;

class LoginLockoutMiddleware
{
    public function handle(Request $request): void
    {
        // Only check on login path
        if (!str_contains($request->path(), '/auth/login')) {
            return;
        }

        $ip = $request->ip();
        $db = Database::getInstance();

        $attempt = $db->fetchOne(
            "SELECT locked_until FROM login_attempts WHERE ip_address = ? AND locked_until > NOW()",
            [$ip]
        );

        if ($attempt) {
            $diff = strtotime($attempt['locked_until']) - time();
            $minutes = ceil($diff / 60);
            Response::forbidden("تم حظر محاولات الدخول من جهازك مؤقتاً بسبب محاولات فاشلة متكررة. يرجى المحاولة بعد {$minutes} دقيقة.");
        }
    }
}

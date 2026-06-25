<?php
// core/Request.php
// HTTP Request parser

declare(strict_types=1);

namespace Core;

class Request
{
    private array $body   = [];
    private array $query  = [];
    private array $params = [];   // Route params set by Router
    private array $files  = [];
    private array $headers = [];

    public function __construct()
    {
        $this->query  = $_GET  ?? [];
        $this->files  = $_FILES ?? [];

        // Parse body
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            $this->body = json_decode($raw, true) ?? [];
        } elseif (str_contains($contentType, 'multipart/form-data')
               || str_contains($contentType, 'application/x-www-form-urlencoded')) {
            $this->body = $_POST ?? [];
        }

        // Parse headers
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $header = str_replace('_', '-', substr($key, 5));
                $this->headers[strtolower($header)] = $value;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $this->headers['content-type'] = $_SERVER['CONTENT_TYPE'];
        }

        // Fix for Apache stripping Authorization header
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] 
                   ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] 
                   ?? $_SERVER['AUTHORIZATION'] 
                   ?? null;

        if ($authHeader) {
            $this->headers['authorization'] = $authHeader;
        }

        if (isset($_SERVER['PHP_AUTH_BEARER'])) {
            $this->headers['authorization'] = 'Bearer ' . $_SERVER['PHP_AUTH_BEARER'];
        }
    }

    // -------------------------------------------------------
    // Getters
    // -------------------------------------------------------
    public function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    public function path(): string
    {
        $uri  = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH);
        
        // Handle subdirectory installations (like /Learn/smart-school/)
        $scriptPath = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
        if ($scriptPath !== '/' && str_starts_with($path, $scriptPath)) {
            $path = substr($path, strlen($scriptPath));
        }

        return '/' . ltrim($path, '/');
    }

    public function body(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) return $this->body;
        return $this->body[$key] ?? $default;
    }

    public function query(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) return $this->query;
        return $this->query[$key] ?? $default;
    }

    public function param(string $key, mixed $default = null): mixed
    {
        return $this->params[$key] ?? $default;
    }

    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    public function header(string $key, mixed $default = null): mixed
    {
        return $this->headers[strtolower($key)] ?? $default;
    }

    public function file(string $key): array|null
    {
        return $this->files[$key] ?? null;
    }

    public function ip(): string
    {
        return $_SERVER['HTTP_X_FORWARDED_FOR']
            ?? $_SERVER['HTTP_CLIENT_IP']
            ?? $_SERVER['REMOTE_ADDR']
            ?? '0.0.0.0';
    }

    public function userAgent(): string
    {
        return $_SERVER['HTTP_USER_AGENT'] ?? '';
    }

    public function bearerToken(): ?string
    {
        $auth = $this->header('authorization', '');
        if (str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }
        return null;
    }

    // -------------------------------------------------------
    // Input helpers
    // -------------------------------------------------------
    public function all(): array
    {
        return array_merge($this->query, $this->body);
    }

    public function only(array $keys): array
    {
        $all = $this->all();
        return array_intersect_key($all, array_flip($keys));
    }

    public function has(string $key): bool
    {
        return isset($this->body[$key]) || isset($this->query[$key]);
    }

    public function integer(string $key, int $default = 0): int
    {
        return (int)($this->body[$key] ?? $this->query[$key] ?? $default);
    }

    public function string(string $key, string $default = ''): string
    {
        $val = $this->body[$key] ?? $this->query[$key] ?? $default;
        return trim((string)$val);
    }

    public function page(): int
    {
        return max(1, (int)($this->query['page'] ?? 1));
    }

    public function perPage(int $default = 20, int $max = 100): int
    {
        return min($max, max(1, (int)($this->query['per_page'] ?? $default)));
    }
}

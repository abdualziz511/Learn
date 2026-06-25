<?php
// core/Router.php
// Lightweight HTTP Router with middleware support

declare(strict_types=1);

namespace Core;

class Router
{
    private array $routes     = [];
    private array $middleware = [];
    private string $prefix    = '';

    // -------------------------------------------------------
    // Route Registration
    // -------------------------------------------------------
    public function get(string $path, callable $handler, array $middleware = []): self
    {
        return $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, callable $handler, array $middleware = []): self
    {
        return $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, callable $handler, array $middleware = []): self
    {
        return $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function patch(string $path, callable $handler, array $middleware = []): self
    {
        return $this->addRoute('PATCH', $path, $handler, $middleware);
    }

    public function delete(string $path, callable $handler, array $middleware = []): self
    {
        return $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    private function addRoute(string $method, string $path, callable $handler, array $middleware = []): self
    {
        $this->routes[] = [
            'method'     => $method,
            'path'       => $this->prefix . $path,
            'handler'    => $handler,
            'middleware' => array_merge($this->middleware, $middleware),
        ];
        return $this;
    }

    // -------------------------------------------------------
    // Grouping with prefix and shared middleware
    // -------------------------------------------------------
    public function group(string $prefix, callable $callback, array $middleware = []): void
    {
        $prevPrefix     = $this->prefix;
        $prevMiddleware = $this->middleware;

        $this->prefix     = $prevPrefix . $prefix;
        $this->middleware = array_merge($prevMiddleware, $middleware);

        $callback($this);

        $this->prefix     = $prevPrefix;
        $this->middleware = $prevMiddleware;
    }

    // -------------------------------------------------------
    // Dispatch
    // -------------------------------------------------------
    public function dispatch(Request $request): void
    {
        $method = $request->method();
        $path   = $request->path();

        // Handle OPTIONS preflight
        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            $params = $this->matchPath($route['path'], $path);
            if ($params === false) continue;

            // Found — inject route params
            $request->setParams($params);

            // Run middleware chain
            foreach ($route['middleware'] as $mw) {
                if (is_string($mw)) {
                    $mwInstance = new $mw();
                } else {
                    $mwInstance = $mw;
                }
                $mwInstance->handle($request);
            }

            // Call handler
            ($route['handler'])($request);
            return;
        }

        // No route matched
        Response::notFound("Route {$method} {$path} not found");
    }

    // -------------------------------------------------------
    // Match path against pattern, extract params
    // Returns array of params or false
    // Example: /api/students/{id} vs /api/students/42 => ['id'=>'42']
    // -------------------------------------------------------
    private function matchPath(string $pattern, string $path): array|false
    {
        // Convert pattern to regex
        $regex = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $pattern);
        $regex = '#^' . $regex . '$#';

        if (!preg_match($regex, $path, $matches)) {
            return false;
        }

        // Extract only named captures
        return array_filter(
            $matches,
            fn($k) => is_string($k),
            ARRAY_FILTER_USE_KEY
        );
    }
}

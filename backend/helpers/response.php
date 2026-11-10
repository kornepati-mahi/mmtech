<?php
declare(strict_types=1);

function cors_headers(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Content-Type: application/json; charset=utf-8');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Public GET responses may be stored, but the browser MUST revalidate them
 * before reusing them. Combined with the ETag below, that keeps responses
 * correct (an admin edit is never hidden) while staying cheap (304 replies).
 */
function cache_headers(int $seconds = 60, bool $public = true): void {
    $scope = $public ? 'public' : 'private';
    header("Cache-Control: {$scope}, max-age=0, must-revalidate");
    header('X-Content-Type-Options: nosniff');
}

/**
 * Admin and write endpoints must never be cached by the browser or a proxy.
 */
function no_store_headers(): void {
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('X-Content-Type-Options: nosniff');
}

function json_response(array $data, int $status = 200): void {
    $body = json_encode($data);

    // ETag support: the browser can revalidate cheaply and get a 304.
    $etag = '"' . md5((string)$body) . '"';
    header('ETag: ' . $etag);

    // Compare without the surrounding quotes; some clients strip them.
    $incoming = trim((string)($_SERVER['HTTP_IF_NONE_MATCH'] ?? ''), "\" \t");
    $current = trim($etag, "\" \t");
    if ($status === 200 && $incoming !== '' && $incoming === $current) {
        http_response_code(304);
        exit;
    }

    http_response_code($status);
    echo $body;
    exit;
}

function get_json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    // Strip a UTF-8 BOM, which would otherwise make json_decode() fail.
    if (strncmp($raw, "\xEF\xBB\xBF", 3) === 0) {
        $raw = substr($raw, 3);
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function sanitize_string($value): string {
    return trim((string)($value ?? ''));
}

/**
 * Slugify a title into a URL-safe identifier.
 */
function slugify(string $value): string {
    $slug = strtolower(trim($value));
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim((string)$slug, '-');
    return $slug !== '' ? $slug : 'post';
}

/**
 * Unique slug for the services table.
 */
function unique_service_slug(PDO $pdo, string $desired, ?int $ignoreId = null): string {
    $base = slugify($desired);
    $slug = $base;
    $i = 2;
    while (true) {
        $sql = 'SELECT id FROM services WHERE slug = ?';
        $params = [$slug];
        if ($ignoreId !== null) {
            $sql .= ' AND id <> ?';
            $params[] = $ignoreId;
        }
        $sql .= ' LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        if (!$stmt->fetch()) {
            return $slug;
        }
        $slug = $base . '-' . $i;
        $i++;
    }
}

/**
 * Unique slug for the blog_posts table.
 */
function unique_post_slug(PDO $pdo, string $desired, ?int $ignoreId = null): string {
    $base = slugify($desired);
    $slug = $base;
    $i = 2;
    while (true) {
        $sql = 'SELECT id FROM blog_posts WHERE slug = ?';
        $params = [$slug];
        if ($ignoreId !== null) {
            $sql .= ' AND id <> ?';
            $params[] = $ignoreId;
        }
        $sql .= ' LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        if (!$stmt->fetch()) {
            return $slug;
        }
        $slug = $base . '-' . $i;
        $i++;
    }
}

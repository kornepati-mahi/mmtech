<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
cors_headers();
cache_headers(300);
try {
    $pdo = get_db_connection();
    $stmt = $pdo->query('SELECT * FROM website_settings WHERE id = 1 LIMIT 1');
    $data = $stmt->fetch() ?: null;
    json_response(['success' => true, 'data' => $data]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to load settings'], 500);
}

<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
cors_headers();
cache_headers(120);
try {
    $pdo = get_db_connection();
    $stmt = $pdo->query(
        'SELECT id, name, slug, description, features, benefits, image, display_order
         FROM services WHERE is_enabled = 1 ORDER BY display_order ASC, id ASC'
    );
    json_response(['success' => true, 'data' => $stmt->fetchAll()]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to load services'], 500);
}

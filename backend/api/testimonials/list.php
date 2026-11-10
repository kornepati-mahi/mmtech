<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
cors_headers();
cache_headers(120);
try {
    $pdo = get_db_connection();
    $stmt = $pdo->query(
        'SELECT id, client_name, company, message, rating, photo FROM testimonials
         WHERE is_published = 1 ORDER BY id DESC LIMIT 60'
    );
    json_response(['success' => true, 'data' => $stmt->fetchAll()]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to load testimonials'], 500);
}

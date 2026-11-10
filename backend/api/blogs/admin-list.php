<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
cors_headers();
no_store_headers();
require_admin();

try {
    $pdo = get_db_connection();
    $stmt = $pdo->query(
        "SELECT id, title, slug, short_description, content, featured_image, category, author, status, published_date, created_at, updated_at
         FROM blog_posts ORDER BY COALESCE(published_date, created_at) DESC, id DESC"
    );
    json_response(['success' => true, 'data' => $stmt->fetchAll()]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to load blog posts'], 500);
}

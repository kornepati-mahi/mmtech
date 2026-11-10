<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
cors_headers();
cache_headers(60);
try {
    $pdo = get_db_connection();
    $stmt = $pdo->query(
        "SELECT id, title, slug, short_description, content, featured_image, category, author, published_date
         FROM blog_posts WHERE status = 'Published' ORDER BY COALESCE(published_date, created_at) DESC LIMIT 50"
    );
    json_response(['success' => true, 'data' => $stmt->fetchAll()]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to load blogs'], 500);
}

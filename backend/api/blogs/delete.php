<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/uploads.php';
require_once __DIR__ . '/../../middleware/auth.php';
cors_headers();
no_store_headers();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = get_json_input();
$id = (int)($input['id'] ?? 0);
if ($id <= 0) {
    json_response(['success' => false, 'message' => 'Invalid post id'], 422);
}

try {
    $pdo = get_db_connection();

    $stmt = $pdo->prepare('SELECT featured_image FROM blog_posts WHERE id = ?');
    $stmt->execute([$id]);
    $post = $stmt->fetch();
    if (!$post) {
        json_response(['success' => false, 'message' => 'Post not found'], 404);
    }

    $del = $pdo->prepare('DELETE FROM blog_posts WHERE id = ?');
    $del->execute([$id]);

    $image = (string)($post['featured_image'] ?? '');
    if ($image !== '') {
        delete_uploaded_image($image);
    }

    json_response(['success' => true, 'message' => 'Post deleted']);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to delete post'], 500);
}

<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
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

$title = sanitize_string($input['title'] ?? '');
if ($title === '') {
    json_response(['success' => false, 'message' => 'Title is required'], 422);
}

$shortDescription = sanitize_string($input['short_description'] ?? '');
$content = (string)($input['content'] ?? '');
$category = sanitize_string($input['category'] ?? '') ?: 'General';
$author = sanitize_string($input['author'] ?? '') ?: 'MM IT Tech Team';
$status = sanitize_string($input['status'] ?? '') ?: 'Draft';
$featuredImage = sanitize_string($input['featured_image'] ?? '');
$publishedDate = sanitize_string($input['published_date'] ?? '');

if (!in_array($status, ['Draft', 'Published', 'Scheduled'], true)) {
    $status = 'Draft';
}
if ($featuredImage !== '' && !preg_match('/^[a-zA-Z0-9._-]+$/', $featuredImage)) {
    $featuredImage = '';
}

try {
    $pdo = get_db_connection();

    $existing = $pdo->prepare('SELECT featured_image, published_date FROM blog_posts WHERE id = ?');
    $existing->execute([$id]);
    $current = $existing->fetch();
    if (!$current) {
        json_response(['success' => false, 'message' => 'Post not found'], 404);
    }

    if ($publishedDate === '') {
        $publishedDate = $status === 'Published'
            ? ($current['published_date'] ?: date('Y-m-d H:i:s'))
            : null;
    } else {
        $publishedDate = date('Y-m-d H:i:s', strtotime($publishedDate) ?: time());
    }

    $slug = unique_post_slug($pdo, $input['slug'] ?? $title, $id);

    $stmt = $pdo->prepare(
        'UPDATE blog_posts
         SET title = ?, slug = ?, short_description = ?, content = ?, featured_image = ?,
             category = ?, author = ?, status = ?, published_date = ?
         WHERE id = ?'
    );
    $stmt->execute([
        $title,
        $slug,
        $shortDescription,
        $content,
        $featuredImage !== '' ? $featuredImage : null,
        $category,
        $author,
        $status,
        $publishedDate,
        $id,
    ]);

    // Remove a replaced image so we do not accumulate orphans.
    $oldImage = (string)($current['featured_image'] ?? '');
    if ($oldImage !== '' && $oldImage !== $featuredImage) {
        delete_uploaded_image($oldImage);
    }

    json_response(['success' => true, 'message' => 'Post updated', 'slug' => $slug]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to update post'], 500);
}

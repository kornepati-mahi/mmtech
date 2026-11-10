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

$title = sanitize_string($input['title'] ?? '');
$shortDescription = sanitize_string($input['short_description'] ?? '');
$content = (string)($input['content'] ?? '');
$category = sanitize_string($input['category'] ?? '') ?: 'General';
$author = sanitize_string($input['author'] ?? '') ?: 'MM IT Tech Team';
$status = sanitize_string($input['status'] ?? '') ?: 'Draft';
$featuredImage = sanitize_string($input['featured_image'] ?? '');
$publishedDate = sanitize_string($input['published_date'] ?? '');

if ($title === '') {
    json_response(['success' => false, 'message' => 'Title is required'], 422);
}

if (!in_array($status, ['Draft', 'Published', 'Scheduled'], true)) {
    $status = 'Draft';
}

// Only keep image references that we actually manage.
if ($featuredImage !== '' && !preg_match('/^[a-zA-Z0-9._-]+$/', $featuredImage)) {
    $featuredImage = '';
}

try {
    $pdo = get_db_connection();
    $slug = unique_post_slug($pdo, $input['slug'] ?? $title);

    if ($publishedDate === '') {
        $publishedDate = $status === 'Published' ? date('Y-m-d H:i:s') : null;
    } else {
        $publishedDate = date('Y-m-d H:i:s', strtotime($publishedDate) ?: time());
    }

    $stmt = $pdo->prepare(
        'INSERT INTO blog_posts (title, slug, short_description, content, featured_image, category, author, status, published_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
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
    ]);

    json_response([
        'success' => true,
        'message' => 'Post created',
        'id' => (int)$pdo->lastInsertId(),
        'slug' => $slug,
    ], 201);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to create post'], 500);
}

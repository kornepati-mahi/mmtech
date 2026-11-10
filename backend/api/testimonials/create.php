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

$name = sanitize_string($input['client_name'] ?? '');
$company = sanitize_string($input['company'] ?? '');
$message = sanitize_string($input['message'] ?? '');
$rating = (int)($input['rating'] ?? 5);
$photo = sanitize_string($input['photo'] ?? '');
$published = !empty($input['is_published']) ? 1 : 0;

if ($name === '' || $message === '') {
    json_response(['success' => false, 'message' => 'Client name and review text are required'], 422);
}
$rating = max(1, min(5, $rating));
if ($photo !== '' && !preg_match('/^[a-zA-Z0-9._-]+$/', $photo)) {
    $photo = '';
}

try {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare(
        'INSERT INTO testimonials (client_name, company, message, rating, photo, is_published)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$name, $company, $message, $rating, $photo !== '' ? $photo : null, $published]);

    json_response([
        'success' => true,
        'message' => 'Review added',
        'id' => (int)$pdo->lastInsertId(),
    ], 201);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to add review'], 500);
}

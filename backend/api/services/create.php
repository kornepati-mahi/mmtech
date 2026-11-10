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

$name = sanitize_string($input['name'] ?? '');
$description = sanitize_string($input['description'] ?? '');
$features = sanitize_string($input['features'] ?? '');
$benefits = sanitize_string($input['benefits'] ?? '');
$image = sanitize_string($input['image'] ?? '');
$order = (int)($input['display_order'] ?? 0);
$enabled = !empty($input['is_enabled']) ? 1 : 0;

if ($name === '') {
    json_response(['success' => false, 'message' => 'Service name is required'], 422);
}
if ($image !== '' && !preg_match('/^[a-zA-Z0-9._-]+$/', $image)) {
    $image = '';
}

try {
    $pdo = get_db_connection();
    $slug = unique_service_slug($pdo, $input['slug'] ?? $name);

    $stmt = $pdo->prepare(
        'INSERT INTO services (name, slug, description, features, benefits, image, display_order, is_enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $name,
        $slug,
        $description,
        $features,
        $benefits,
        $image !== '' ? $image : null,
        $order,
        $enabled,
    ]);

    json_response([
        'success' => true,
        'message' => 'Service created',
        'id' => (int)$pdo->lastInsertId(),
        'slug' => $slug,
    ], 201);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to create service'], 500);
}

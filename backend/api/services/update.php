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
    json_response(['success' => false, 'message' => 'Invalid service id'], 422);
}

$name = sanitize_string($input['name'] ?? '');
if ($name === '') {
    json_response(['success' => false, 'message' => 'Service name is required'], 422);
}

$description = sanitize_string($input['description'] ?? '');
$features = sanitize_string($input['features'] ?? '');
$benefits = sanitize_string($input['benefits'] ?? '');
$image = sanitize_string($input['image'] ?? '');
$order = (int)($input['display_order'] ?? 0);
$enabled = !empty($input['is_enabled']) ? 1 : 0;

if ($image !== '' && !preg_match('/^[a-zA-Z0-9._-]+$/', $image)) {
    $image = '';
}

try {
    $pdo = get_db_connection();

    $existing = $pdo->prepare('SELECT image FROM services WHERE id = ?');
    $existing->execute([$id]);
    $current = $existing->fetch();
    if (!$current) {
        json_response(['success' => false, 'message' => 'Service not found'], 404);
    }

    $slug = unique_service_slug($pdo, $input['slug'] ?? $name, $id);

    $stmt = $pdo->prepare(
        'UPDATE services
         SET name = ?, slug = ?, description = ?, features = ?, benefits = ?,
             image = ?, display_order = ?, is_enabled = ?
         WHERE id = ?'
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
        $id,
    ]);

    $oldImage = (string)($current['image'] ?? '');
    if ($oldImage !== '' && $oldImage !== $image) {
        delete_uploaded_image($oldImage);
    }

    json_response(['success' => true, 'message' => 'Service updated', 'slug' => $slug]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to update service'], 500);
}

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

if (empty($_FILES['image'])) {
    json_response(['success' => false, 'message' => 'No image was uploaded'], 422);
}

try {
    $name = store_uploaded_image($_FILES['image']);
    json_response([
        'success' => true,
        'message' => 'Image uploaded',
        'filename' => $name,
        'url' => upload_url($name),
    ], 201);
} catch (RuntimeException $e) {
    json_response(['success' => false, 'message' => $e->getMessage()], 422);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Upload failed'], 500);
}

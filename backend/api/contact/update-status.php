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
$status = sanitize_string($input['status'] ?? '');
$allowed = ['New','Contacted','In Progress','Converted','Closed'];
if ($id <= 0 || !in_array($status, $allowed, true)) {
    json_response(['success' => false, 'message' => 'Invalid input'], 422);
}
try {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('UPDATE contact_submissions SET status = ? WHERE id = ?');
    $stmt->execute([$status, $id]);
    json_response(['success' => true]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to update status'], 500);
}
?>

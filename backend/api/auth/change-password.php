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

$admin = require_admin();
$input = get_json_input();

$current = (string)($input['current_password'] ?? '');
$next = (string)($input['new_password'] ?? '');
$confirm = (string)($input['confirm_password'] ?? '');

if ($current === '' || $next === '') {
    json_response(['success' => false, 'message' => 'Current and new password are required'], 422);
}
if (strlen($next) < 8) {
    json_response(['success' => false, 'message' => 'The new password must be at least 8 characters long'], 422);
}
if ($confirm !== '' && $confirm !== $next) {
    json_response(['success' => false, 'message' => 'The new passwords do not match'], 422);
}
if ($current === $next) {
    json_response(['success' => false, 'message' => 'The new password must be different from the current one'], 422);
}

try {
    $pdo = get_db_connection();

    $stmt = $pdo->prepare('SELECT password_hash FROM admins WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$admin['id']]);
    $row = $stmt->fetch();
    if (!$row) {
        json_response(['success' => false, 'message' => 'Admin account not found'], 404);
    }

    if (!password_verify($current, (string)$row['password_hash'])) {
        json_response(['success' => false, 'message' => 'Your current password is incorrect'], 401);
    }

    $hash = password_hash($next, PASSWORD_DEFAULT);
    $upd = $pdo->prepare('UPDATE admins SET password_hash = ? WHERE id = ?');
    $upd->execute([$hash, (int)$admin['id']]);

    // Rotate the session id so the old session cannot be reused.
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);
    }

    json_response(['success' => true, 'message' => 'Password updated successfully']);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to update password'], 500);
}

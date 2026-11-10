<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
cors_headers();
no_store_headers();
start_secure_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = get_json_input();
$email = filter_var(sanitize_string($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = (string)($input['password'] ?? '');
if (!$email || $password === '') {
    json_response(['success' => false, 'message' => 'Email and password are required'], 422);
}

try {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role FROM admins WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        json_response(['success' => false, 'message' => 'Invalid credentials'], 401);
    }
    $_SESSION['admin'] = [
        'id' => $admin['id'],
        'name' => $admin['name'],
        'email' => $admin['email'],
        'role' => $admin['role'],
    ];
    json_response(['success' => true, 'admin' => $_SESSION['admin']]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Login failed'], 500);
}
?>

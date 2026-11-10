<?php
declare(strict_types=1);
require_once __DIR__ . '/../helpers/response.php';

function start_secure_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        session_start();
    }
}

function require_admin(): array {
    start_secure_session();
    if (empty($_SESSION['admin'])) {
        json_response(['success' => false, 'message' => 'Unauthorized'], 401);
    }
    return $_SESSION['admin'];
}
?>

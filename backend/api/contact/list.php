<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
cors_headers();
no_store_headers();
require_admin();

try {
    $pdo = get_db_connection();
    $stmt = $pdo->query('SELECT id, full_name, email, phone, company_name, service_interested, subject, status, created_at FROM contact_submissions ORDER BY created_at DESC LIMIT 200');
    $rows = $stmt->fetchAll();
    json_response(['success' => true, 'data' => $rows]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to load enquiries'], 500);
}
?>

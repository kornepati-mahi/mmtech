<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
cors_headers();
no_store_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = get_json_input();
$full_name = sanitize_string($input['full_name'] ?? '');
$email = filter_var(sanitize_string($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$phone = sanitize_string($input['phone'] ?? '');
$company_name = sanitize_string($input['company_name'] ?? '');
$service_interested = sanitize_string($input['service_interested'] ?? '');
$subject = sanitize_string($input['subject'] ?? '');
$message = sanitize_string($input['message'] ?? '');

if ($full_name === '' || !$email || $phone === '' || $subject === '' || $message === '') {
    json_response(['success' => false, 'message' => 'Please fill all required fields with valid values'], 422);
}

// Basic duplicate/spam guard: same email+subject+message within 2 minutes
try {
    $pdo = get_db_connection();
    $dup = $pdo->prepare('SELECT id FROM contact_submissions WHERE email = ? AND subject = ? AND message = ? AND created_at >= (NOW() - INTERVAL 2 MINUTE) LIMIT 1');
    $dup->execute([$email, $subject, $message]);
    if ($dup->fetch()) {
        json_response(['success' => false, 'message' => 'Duplicate submission detected. Please wait before trying again.'], 429);
    }

    $stmt = $pdo->prepare('INSERT INTO contact_submissions (full_name, email, phone, company_name, service_interested, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, "New")');
    $stmt->execute([$full_name, $email, $phone, $company_name, $service_interested, $subject, $message]);
    json_response(['success' => true, 'message' => 'Enquiry submitted successfully', 'id' => (int)$pdo->lastInsertId()]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to submit enquiry'], 500);
}
?>

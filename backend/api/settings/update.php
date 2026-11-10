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

$fields = [
    'company_name' => sanitize_string($input['company_name'] ?? ''),
    'company_description' => sanitize_string($input['company_description'] ?? ''),
    'contact_email' => sanitize_string($input['contact_email'] ?? ''),
    'phone' => sanitize_string($input['phone'] ?? ''),
    'address' => sanitize_string($input['address'] ?? ''),
    'hero_title' => sanitize_string($input['hero_title'] ?? ''),
    'hero_description' => sanitize_string($input['hero_description'] ?? ''),
    'cta_text' => sanitize_string($input['cta_text'] ?? ''),
    'footer_text' => sanitize_string($input['footer_text'] ?? ''),
    'whatsapp_number' => sanitize_string($input['whatsapp_number'] ?? ''),
];

// Key numbers shown across the site (Home, About, Reviews).
$STAT_KEYS = ['years', 'uptime', 'endpoints', 'response', 'clients', 'engineers', 'secured', 'recommend', 'rating'];
$stats = [];
foreach ($STAT_KEYS as $key) {
    $stats[$key] = sanitize_string($input['site_stats'][$key] ?? '');
}
$fields['site_stats'] = json_encode($stats, JSON_UNESCAPED_SLASHES);

if ($fields['company_name'] === '') {
    json_response(['success' => false, 'message' => 'Company name is required'], 422);
}
if ($fields['contact_email'] !== '' && !filter_var($fields['contact_email'], FILTER_VALIDATE_EMAIL)) {
    json_response(['success' => false, 'message' => 'Please enter a valid contact email'], 422);
}
// WhatsApp links need digits only, with an optional leading country code.
if ($fields['whatsapp_number'] !== '' && !preg_match('/^\+?[0-9]{6,20}$/', $fields['whatsapp_number'])) {
    json_response(['success' => false, 'message' => 'The WhatsApp number must contain digits only (e.g. 447700900000)'], 422);
}

try {
    $pdo = get_db_connection();

    $stmt = $pdo->prepare(
        'UPDATE website_settings SET
            company_name = ?, company_description = ?, contact_email = ?, phone = ?, address = ?,
            hero_title = ?, hero_description = ?, cta_text = ?, footer_text = ?,
            site_stats = ?, whatsapp_number = ?
         WHERE id = 1'
    );
    $stmt->execute([
        $fields['company_name'],
        $fields['company_description'],
        $fields['contact_email'],
        $fields['phone'],
        $fields['address'],
        $fields['hero_title'],
        $fields['hero_description'],
        $fields['cta_text'],
        $fields['footer_text'],
        $fields['site_stats'],
        $fields['whatsapp_number'],
    ]);

    if ($stmt->rowCount() === 0) {
        $ins = $pdo->prepare(
            'INSERT INTO website_settings
             (id, company_name, company_description, contact_email, phone, address, hero_title, hero_description, cta_text, footer_text, site_stats, whatsapp_number)
             VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $ins->execute([
            $fields['company_name'],
            $fields['company_description'],
            $fields['contact_email'],
            $fields['phone'],
            $fields['address'],
            $fields['hero_title'],
            $fields['hero_description'],
            $fields['cta_text'],
            $fields['footer_text'],
            $fields['site_stats'],
            $fields['whatsapp_number'],
        ]);
    }

    json_response(['success' => true, 'message' => 'Settings saved']);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Failed to save settings'], 500);
}

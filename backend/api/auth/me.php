<?php
declare(strict_types=1);
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
cors_headers();
no_store_headers();
$admin = require_admin();
json_response(['success' => true, 'admin' => $admin]);
?>

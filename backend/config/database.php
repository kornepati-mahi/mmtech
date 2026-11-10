<?php
// XAMPP local MySQL configuration
declare(strict_types=1);

// Use the TCP host (127.0.0.1) instead of "localhost".
// On Windows/XAMPP "localhost" makes the MySQL client use a named pipe
// (\\.\pipe\mysql), which adds ~2 seconds to every single connection.
// The raw TCP loopback connects in under a millisecond.
// Override with the DB_HOST environment variable if you need another host.
$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_PORT = getenv('DB_PORT') ?: '3306';
$DB_NAME = getenv('DB_NAME') ?: 'mm_it_tech_db';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';

function get_db_connection(): PDO {
    global $DB_HOST, $DB_PORT, $DB_NAME, $DB_USER, $DB_PASS;
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        // Reuse the connection across requests instead of reconnecting each time.
        PDO::ATTR_PERSISTENT => true,
        // Fail fast rather than waiting on a dead socket.
        PDO::ATTR_TIMEOUT => 5,
    ];
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
    return $pdo;
}

<?php
declare(strict_types=1);

/**
 * Image upload helpers.
 *
 * Uploaded files are stored in <project-root>/uploads so that both the Vite
 * dev server (through a proxy) and Apache/XAMPP can serve them statically.
 */

const UPLOAD_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const UPLOAD_ALLOWED = [
    'image/jpeg' => 'jpg',
    'image/pjpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];

function uploads_dir(): string {
    return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads';
}

/**
 * Ensure the upload directory exists and is not web-writable with listings.
 */
function ensure_uploads_dir(): string {
    $dir = uploads_dir();
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $index = $dir . DIRECTORY_SEPARATOR . 'index.php';
    if (!file_exists($index)) {
        @file_put_contents($index, "<?php http_response_code(403); exit;\n");
    }
    return $dir;
}

/**
 * Validate and store an uploaded image. Returns the generated filename.
 */
function store_uploaded_image(array $file): string {
    $error = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($error !== UPLOAD_ERR_OK) {
        $messages = [
            UPLOAD_ERR_INI_SIZE => 'The image is larger than the server upload limit.',
            UPLOAD_ERR_FORM_SIZE => 'The image is larger than the allowed size.',
            UPLOAD_ERR_PARTIAL => 'The image was only partially uploaded.',
            UPLOAD_ERR_NO_FILE => 'No image was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'The server has no temporary folder for uploads.',
            UPLOAD_ERR_CANT_WRITE => 'The server could not write the uploaded image.',
            UPLOAD_ERR_EXTENSION => 'A PHP extension blocked the upload.',
        ];
        throw new RuntimeException($messages[$error] ?? 'The image could not be uploaded.');
    }

    if ((int)($file['size'] ?? 0) > UPLOAD_MAX_BYTES) {
        throw new RuntimeException('The image must be smaller than 5 MB.');
    }

    $tmp = (string)($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        throw new RuntimeException('The uploaded file could not be verified.');
    }

    // Verify it is genuinely an image, not a renamed script.
    $info = @getimagesize($tmp);
    $mime = (string)($info['mime'] ?? '');
    if ($mime === '' || !isset(UPLOAD_ALLOWED[$mime])) {
        throw new RuntimeException('Only JPG, PNG, WEBP and GIF images are allowed.');
    }

    $ext = UPLOAD_ALLOWED[$mime];
    $name = bin2hex(random_bytes(12)) . '.' . $ext;
    $dir = ensure_uploads_dir();
    $target = $dir . DIRECTORY_SEPARATOR . $name;

    if (!@move_uploaded_file($tmp, $target)) {
        throw new RuntimeException('The server could not save the uploaded image.');
    }
    @chmod($target, 0644);

    return $name;
}

/**
 * Public path of an uploaded image, relative to the application root.
 */
function upload_url(string $filename): string {
    return '/uploads/' . $filename;
}

/**
 * Remove a previously uploaded image (best effort).
 */
function delete_uploaded_image(string $filename): void {
    if (!preg_match('/^[a-zA-Z0-9._-]+$/', $filename)) {
        return;
    }
    $path = uploads_dir() . DIRECTORY_SEPARATOR . $filename;
    if (is_file($path)) {
        @unlink($path);
    }
}

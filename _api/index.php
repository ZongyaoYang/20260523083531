<?php

/**
 * PeakAgent Interview API — entry point.
 *
 * Routes /handlers/<path> to handlers/<path>.php and applies the CORS headers
 * needed for the Next.js dev server (localhost:3000) to call this API
 * (localhost:8080) during local development.
 *
 * In real PeakAgent this is `_api/index.php` + `Library\Page` doing the
 * routing. We've inlined a stripped-down version for the test.
 */

// --- CORS for cross-origin dev (Next.js on :3000 → PHP on :8080) ---
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- Bootstrap ---
require_once __DIR__ . '/lib/helpers.php';
require_once __DIR__ . '/lib/ElasticClient.php';

// --- Built-in PHP server: serve real static files as-is. ---
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (php_sapi_name() === 'cli-server' && $path !== '/' && file_exists(__DIR__ . $path) && !is_dir(__DIR__ . $path)) {
    return false;
}

// --- Route /handlers/<path> → handlers/<path>.php ---
if (!preg_match('#^/handlers/(.+)$#', $path, $m)) {
    http_response_code(404);
    _ej(['ok' => 0, 'error' => 'Not found. Try /handlers/front/init']);
}

$handlerPath = realpath(__DIR__ . '/handlers/' . $m[1] . '.php');
$handlersDir = realpath(__DIR__ . '/handlers');

// Path traversal guard
if (!$handlerPath || strpos($handlerPath, $handlersDir) !== 0 || !is_file($handlerPath)) {
    http_response_code(404);
    _ej(['ok' => 0, 'error' => 'Handler not found: ' . $m[1]]);
}

// Decode JSON bodies into $_POST so handlers can use either form-encoded or JSON.
if (!empty($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $_POST = array_merge($_POST, $decoded);
        }
    }
}

include $handlerPath;

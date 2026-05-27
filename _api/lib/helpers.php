<?php

/**
 * Shared helpers. In real PeakAgent these live in app_top.php / Library classes.
 */

/**
 * Echo JSON and exit. Mirrors the `_ej()` convention used throughout
 * the real PeakAgent handlers.
 */
function _ej(array $data): void
{
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

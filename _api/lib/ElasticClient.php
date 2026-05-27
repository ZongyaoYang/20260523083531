<?php

/**
 * Tiny cURL wrapper around the public PeakAgent search cluster.
 *
 * Usage:
 *   $es = new ElasticClient();
 *   $res = $es->query('listings', [
 *     'size'  => 20,
 *     'query' => ['bool' => ['must' => [['range' => ['beds' => ['gte' => 3]]]]]],
 *   ]);
 *   $hits = $res['hits']['hits'] ?? [];
 */
class ElasticClient
{
    private string $baseUrl;

    public function __construct(string $baseUrl = 'https://tools.closehack.com/search')
    {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    /**
     * POST a query body to {baseUrl}/{index}/_search and return the decoded response.
     *
     * Throws RuntimeException on transport / non-2xx errors so handler code can
     * catch and translate to its preferred error shape.
     */
    public function query(string $index, array $body): array
    {
        $url = $this->baseUrl . '/' . rawurlencode($index) . '/_search';

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($body),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 15,
        ]);

        $raw    = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err    = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            throw new RuntimeException("Elastic request failed: $err");
        }

        if ($status < 200 || $status >= 300) {
            throw new RuntimeException("Elastic returned HTTP $status: $raw");
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            throw new RuntimeException("Elastic returned non-JSON response");
        }

        return $decoded;
    }
}

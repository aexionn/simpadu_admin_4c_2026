<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PegawaiClientService
{
    private string $baseUrl;
    private string $apiToken;
    private int    $cacheTtl;
    private int    $timeout;
    private int    $retries;
    private int    $retryDelayMs;

    public function __construct()
    {
        $this->baseUrl       = rtrim(config('services.pegawai_api.base_url'), '/');
        $this->apiToken      = config('services.pegawai_api.api_token');
        $this->cacheTtl      = (int) config('services.pegawai_api.cache_ttl', 3600);
        $this->timeout       = (int) config('services.pegawai_api.timeout', 5);
        $this->retries       = (int) config('services.pegawai_api.retries', 2);
        $this->retryDelayMs  = (int) config('services.pegawai_api.retry_delay_ms', 200);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════════════════════════════════════════

    public function getNipByUserId(int $userId): ?string
    {
        return $this->cachedOrFetch(
            "pegawai:nip_by_user:{$userId}",
            fn () => $this->get("/pegawai/by-user/{$userId}"),
        );
    }

    public function getNipByEmail(string $email): ?string
    {
        return $this->cachedOrFetch(
            "pegawai:nip_by_email:" . md5($email),
            fn () => $this->get("/pegawai/by-email", ['email' => $email]),
        );
    }

    public function getPegawai(int $id): ?array
    {
        return $this->cachedOrFetch(
            "pegawai:profile:{$id}",
            fn () => $this->get("/pegawai/{$id}"),
        );
    }

    public function getAllPegawai(): array
    {
        return $this->cachedOrFetch(
            'pegawai:all',
            fn () => $this->get('/pegawai'),
            [],
        );
    }

    public function clearNipCache(int $userId, string $email): void
    {
        Cache::forget("pegawai:nip_by_user:{$userId}");
        Cache::forget("pegawai:nip_by_email:" . md5($email));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HTTP
    // ═══════════════════════════════════════════════════════════════════════════

    private function get(string $path, array $query = []): ?array
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->timeout($this->timeout)
                ->retry($this->retries, $this->retryDelayMs)
                ->get("{$this->baseUrl}{$path}", $query);

            if ($response->successful()) {
                return $response->json();
            }

            if ($response->status() === 404) {
                return null;
            }

            Log::warning('Pegawai service request failed', [
                'path'   => $path,
                'status' => $response->status(),
            ]);

            return null;
        } catch (ConnectionException $e) {
            Log::error('Pegawai service unreachable', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function cachedOrFetch(string $key, callable $fetcher, mixed $fallback = null): mixed
    {
        return Cache::remember($key, $this->cacheTtl, function () use ($fetcher, $fallback) {
            try {
                $result = $fetcher();
                return $result ?? $fallback;
            } catch (\Exception $e) {
                Log::error('Pegawai service error', ['error' => $e->getMessage()]);
                return $fallback;
            }
        });
    }
}
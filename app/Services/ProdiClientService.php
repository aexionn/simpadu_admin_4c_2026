<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProdiClientService
{
    private string $baseUrl;
    private int $cacheTtl;
    private int $timeout;
    private int $retries;
    private int $retryDelayMs;
    private ?string $apiKey;

    public function __construct()
    {
        $this->baseUrl      = rtrim(config('services.prodi_api.base_url'), '/');
        $this->cacheTtl     = (int) config('services.prodi_api.cache_ttl', 3600);
        $this->timeout      = (int) config('services.prodi_api.timeout', 5);
        $this->retries      = (int) config('services.prodi_api.retries', 2);
        $this->retryDelayMs = (int) config('services.prodi_api.retry_delay_ms', 200);
    }

    public function getProdi(int $prodiId): ?array
    {
        return $this->rememberOrFetch(
            "prodi:{$prodiId}",
            fn () => $this->request("/prodi/{$prodiId}")
        );
    }

    public function getAllProdi(): array
    {
        return $this->rememberOrFetch(
            'prodi:all',
            fn () => $this->request('/prodi'),
            []
        );
    }

    public function getJurusan(int $jurusanId): ?array
    {
        return $this->rememberOrFetch(
            "jurusan:{$jurusanId}",
            fn () => $this->request("/jurusan/{$jurusanId}")
        );
    }

    public function getAllJurusan(): array
    {
        return $this->rememberOrFetch(
            'jurusan:all',
            fn () => $this->request('/jurusan'),
            []
        );
    }

    /**
     * Fetch many prodi at once. Returns id => data. Cache-hits avoid network;
     * misses are batched in a single upstream call when supported, otherwise fall back.
     */
    public function getProdiByIds(array $ids): array
    {
        $ids    = array_values(array_unique(array_map('intval', $ids)));
        $result = [];
        $missing = [];

        foreach ($ids as $id) {
            $cached = Cache::get("prodi:{$id}");
            if ($cached !== null) {
                $result[$id] = $cached;
            } else {
                $missing[] = $id;
            }
        }

        if ($missing) {
            $fetched = $this->request('/prodi', ['ids' => implode(',', $missing)]);
            if (is_array($fetched)) {
                foreach ($fetched as $row) {
                    $id = $row['id'] ?? null;
                    if ($id !== null) {
                        Cache::put("prodi:{$id}", $row, $this->cacheTtl);
                        $result[$id] = $row;
                    }
                }
            }
        }

        return $result;
    }

    public function clearProdiCache(int $prodiId): void
    {
        Cache::forget("prodi:{$prodiId}");
    }

    public function clearJurusanCache(int $jurusanId): void
    {
        Cache::forget("jurusan:{$jurusanId}");
    }

    public function clearAllProdi(): void
    {
        Cache::forget('prodi:all');
    }

    public function clearAllJurusan(): void
    {
        Cache::forget('jurusan:all');
    }

    private function rememberOrFetch(string $key, \Closure $fetcher, mixed $fallback = null): mixed
    {
        $cached = Cache::get($key);
        if ($cached !== null) {
            return $cached;
        }

        $lock = Cache::lock("lock:{$key}", 10);
        try {
            $lock->block(5); 
            
            $cached = Cache::get($key);
            if ($cached !== null) {
                return $cached;
            }

            $data = $fetcher();
            if ($data === null) {
                return $fallback;
            }

            Cache::put($key, $data, $this->cacheTtl);
            return $data;
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            Log::warning('Prodi cache lock timeout', ['key' => $key]);
            return $fallback;
        } finally {
            optional($lock)->release();
        }
    }

    private function request(string $path, array $query = []): ?array
    {
        try {
            $req = Http::timeout($this->timeout)
                ->retry($this->retries, $this->retryDelayMs, throw: false)
                ->acceptJson();

            $response = $req->get($this->baseUrl . $path, $query);

            return $this->handleResponse($response, $path);
        } catch (ConnectionException $e) {
            Log::warning('Prodi API connection failed', [
                'path'  => $path,
                'error' => $e->getMessage(),
            ]);
            return null;
        } catch (\Throwable $e) {
            Log::error('Prodi API unexpected error', [
                'path'  => $path,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    private function handleResponse(Response $response, string $path): ?array
    {
        if ($response->failed()) {
            Log::warning('Prodi API failure response', [
                'path'   => $path,
                'status' => $response->status(),
                'body'   => mb_substr($response->body(), 0, 500),
            ]);
            return null;
        }

        $json = $response->json();
        return is_array($json) ? $json : null;
    }
}
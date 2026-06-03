<?php

namespace App\Services;

use App\Models\Jurusan;
use App\Models\Prodi;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProdiClientService
{
    private string $baseUrl;
    private int $cacheTtl;
    private int $timeout;
    private int $retries;
    private int $retryDelayMs;

    public function __construct()
    {
        // Kept for future HTTP reversion; currently unused.
        $this->baseUrl      = rtrim(config('services.prodi_api.base_url', ''), '/');
        $this->cacheTtl     = (int) config('services.prodi_api.cache_ttl', 3600);
        $this->timeout      = (int) config('services.prodi_api.timeout', 5);
        $this->retries      = (int) config('services.prodi_api.retries', 2);
        $this->retryDelayMs = (int) config('services.prodi_api.retry_delay_ms', 200);
    }

    public function getProdi(int $prodiId): ?Prodi
    {
        return $this->rememberOrFetch(
            "prodi:{$prodiId}",
            fn () => Prodi::find($prodiId)
        );
    }

    public function getAllProdi(): Collection
    {
        return $this->rememberOrFetch(
            'prodi:all',
            fn () => Prodi::with('jurusan')->get(),
            collect()
        );
    }

    public function getJurusan(int $jurusanId): ?Jurusan
    {
        return $this->rememberOrFetch(
            "jurusan:{$jurusanId}",
            fn () => Jurusan::find($jurusanId)
        );
    }

    public function getAllJurusan(): Collection
    {
        return $this->rememberOrFetch(
            'jurusan:all',
            fn () => Jurusan::all(),
            collect()
        );
    }

    /**
     * Fetch many prodi at once. Returns a Collection keyed by id_prodi.
     * Cache-hits avoid DB queries; misses are fetched in a single whereIn().
     */
    public function getProdiByIds(array $ids): Collection
    {
        $ids     = array_values(array_unique(array_map('intval', $ids)));
        $result  = collect();
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
            $fetched = Prodi::whereIn('id_prodi', $missing)->get();
            foreach ($fetched as $prodi) {
                Cache::put("prodi:{$prodi->id_prodi}", $prodi, $this->cacheTtl);
                $result[$prodi->id_prodi] = $prodi;
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
            if ($data === null || (is_countable($data) && count($data) === 0 && $data instanceof Collection)) {
                // Distinguish "not found" (null model) from "empty collection" —
                // for single-model fetchers null means not found → return fallback.
                if ($data === null) {
                    return $fallback;
                }
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
}
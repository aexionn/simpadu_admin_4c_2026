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
        $data = $this->rememberOrFetch(
            "prodi:{$prodiId}",
            function () use ($prodiId): ?array {
                $model = Prodi::find($prodiId);
                return $model ? $model->toArray() : null;
            }
        );

        if (!is_array($data)) {
            return null;
        }

        return Prodi::hydrate([$data])->first();
    }

    public function getAllProdi(): Collection
    {
        $data = $this->rememberOrFetch(
            'prodi:all',
            fn (): array => Prodi::with('jurusan')->get()->toArray(),
            []
        );

        if (!is_array($data) || empty($data)) {
            return Prodi::hydrate([]);
        }

        return Prodi::hydrate($data);
    }

    public function getJurusan(int $jurusanId): ?Jurusan
    {
        $data = $this->rememberOrFetch(
            "jurusan:{$jurusanId}",
            function () use ($jurusanId): ?array {
                $model = Jurusan::find($jurusanId);
                return $model ? $model->toArray() : null;
            }
        );

        if (!is_array($data)) {
            return null;
        }

        return Jurusan::hydrate([$data])->first();
    }

    public function getAllJurusan(): Collection
    {
        $data = $this->rememberOrFetch(
            'jurusan:all',
            fn (): array => Jurusan::all()->toArray(),
            []
        );

        if (!is_array($data) || empty($data)) {
            return Jurusan::hydrate([]);
        }

        return Jurusan::hydrate($data);
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
                // Cache stores arrays — hydrate back to model
                $result[$id] = is_array($cached)
                    ? Prodi::hydrate([$cached])->first()
                    : $cached;
            } else {
                $missing[] = $id;
            }
        }

        if ($missing) {
            $fetched = Prodi::whereIn('id_prodi', $missing)->get();
            foreach ($fetched as $prodi) {
                // Store plain array in cache, NEVER the model instance
                Cache::put("prodi:{$prodi->id_prodi}", $prodi->toArray(), $this->cacheTtl);
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
            // May be an array (new format) or a stale Model (old/broken cache).
            // Always return as-is; callers are responsible for hydration.
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

            // null means "not found" — do not cache, return fallback
            if ($data === null) {
                return $fallback;
            }

            // Store only plain PHP arrays in cache
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
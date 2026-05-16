<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ProdiClientService
{
    private string $baseUrl;
    private int    $cacheTtl;

    public function __construct()
    {
        $this->baseUrl  = config('services.prodi_api.base_url');
        $this->cacheTtl = config('services.prodi_api.cache_ttl', 3600);
    }

    /**
     * Get a single prodi by ID.
     * Result is cached to avoid repeated external calls.
     */
    public function getProdi(int $prodiId): ?array
    {
        return Cache::remember(
            "prodi_{$prodiId}",
            $this->cacheTtl,
            function () use ($prodiId) {
                $response = Http::timeout(5)
                    ->get("{$this->baseUrl}/prodi/{$prodiId}");

                if ($response->failed()) {
                    return null;
                }

                return $response->json();
            }
        );
    }

    /**
     * Get a single jurusan by ID.
     */
    public function getJurusan(int $jurusanId): ?array
    {
        return Cache::remember(
            "jurusan_{$jurusanId}",
            $this->cacheTtl,
            function () use ($jurusanId) {
                $response = Http::timeout(5)
                    ->get("{$this->baseUrl}/jurusan/{$jurusanId}");

                if ($response->failed()) {
                    return null;
                }

                return $response->json();
            }
        );
    }

    public function getAllJurusan(): array
    {
        return Cache::remember(
            'jurusan_all',
            $this->cacheTtl,
            function () {
                $response = Http::timeout(5)
                    ->get("{$this->baseUrl}/jurusan");

                if ($response->failed()) {
                    return [];
                }

                return $response->json();
            }
        );
    }
    /**
     * Get all prodi — useful for dropdown lists.
     */
    public function getAllProdi(): array
    {
        return Cache::remember(
            'prodi_all',
            $this->cacheTtl,
            function () {
                $response = Http::timeout(5)
                    ->get("{$this->baseUrl}/prodi");

                if ($response->failed()) {
                    return [];
                }

                return $response->json();
            }
        );
    }

    /**
     * Force-clear the cache for a specific prodi.
     * Call this if you know the external data has changed.
     */
    public function clearProdiCache(int $prodiId): void
    {
        Cache::forget("prodi_{$prodiId}");
    }

    public function clearAllCache(): void
    {
        Cache::forget('prodi_all');
    }
}
<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\ManageMataKuliahRequest;
use App\Http\Resources\MataKuliahResource;
use App\Models\Kurikulum;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class KurikulumMataKuliahController extends Controller
{
    public function index(int $kurikulumId): JsonResponse
    {
        $kurikulum = Kurikulum::with('mataKuliahs')->findOrFail($kurikulumId);
        return $this->successCollection(
            MataKuliahResource::collection($kurikulum->mataKuliahs),
            'Data mata kuliah kurikulum berhasil diambil'
        );
    }

    public function store(int $kurikulumId, ManageMataKuliahRequest $request): JsonResponse
    {
        $kurikulum = Kurikulum::findOrFail($kurikulumId);
        DB::transaction(fn () => $kurikulum->mataKuliahs()->syncWithoutDetaching([$request->id_mk]));

        return $this->successResponse('Mata kuliah ditambahkan ke kurikulum', 201);
    }

    public function destroy(int $kurikulumId, int $mkId): JsonResponse
    {
        $kurikulum = Kurikulum::findOrFail($kurikulumId);
        DB::transaction(fn () => $kurikulum->mataKuliahs()->detach($mkId));

        return $this->successMessage('Mata kuliah dihapus dari kurikulum');
    }
}
<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\NilaiStoreRequest;
use App\Http\Requests\NilaiUpdateRequest;
use App\Models\Nilai;
use App\Http\Resources\NilaiResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class NilaiController extends Controller
{
    public function index(): JsonResponse
    {
        $nilai = Nilai::with(['khs', 'mataKuliah'])
            ->orderByDesc('ID_NILAI')
            ->get();

        return $this->successCollection(
            NilaiResource::collection($nilai),
            'Data Nilai berhasil diambil'
        );
    }

    public function store(NilaiStoreRequest $request): JsonResponse
    {
        $nilai = DB::transaction(fn () => Nilai::create($request->validated()));

        return $this->successResponse(
            new NilaiResource($nilai->load(['khs', 'mataKuliah'])),
            'Nilai berhasil ditambahkan',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $nilai = Nilai::with(['khs', 'mataKuliah'])->findOrFail($id);

        return $this->successResponse(
            new NilaiResource($nilai),
            'Detail Nilai berhasil diambil'
        );
    }

    public function update(NilaiUpdateRequest $request, int $id): JsonResponse
    {
        $nilai = Nilai::findOrFail($id);
        DB::transaction(fn () => $nilai->update($request->validated()));

        return $this->successResponse(
            new NilaiResource($nilai->fresh()->load(['khs', 'mataKuliah'])),
            'Nilai berhasil diperbarui'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        DB::transaction(fn () => Nilai::findOrFail($id)->delete());

        return $this->successMessage('Nilai berhasil dihapus');
    }
}

<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\KrsStoreRequest;
use App\Http\Requests\KrsUpdateRequest;
use App\Http\Requests\ManageMataKuliahRequest;
use App\Models\Krs;
use App\Http\Resources\KrsResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class KrsController extends Controller
{
    public function index(): JsonResponse
    {
        $krs = Krs::with('mataKuliahs')->orderByDesc('ID_KRS')->get();
        return $this->successCollection(KrsResource::collection($krs), 'Data KRS berhasil diambil');
    }

    public function store(KrsStoreRequest $request): JsonResponse
    {
        $krs = DB::transaction(fn () => Krs::create($request->validated()));

        return $this->successResponse(new KrsResource($krs->load('mataKuliahs')), 'KRS berhasil ditambahkan', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(new KrsResource(Krs::with('mataKuliahs')->findOrFail($id)), 'Detail KRS berhasil diambil');
    }

    public function update(KrsUpdateRequest $request, int $id): JsonResponse
    {
        $krs = Krs::findOrFail($id);
        DB::transaction(fn () => $krs->update($request->validated()));

        return $this->successResponse(new KrsResource($krs->fresh()->load('mataKuliahs')), 'KRS berhasil diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        DB::transaction(fn () => Krs::findOrFail($id)->delete());

        return $this->successMessage('KRS berhasil dihapus');
    }

    public function addMataKuliah(int $krsId, ManageMataKuliahRequest $request): JsonResponse
    {
        $krs = Krs::findOrFail($krsId);
        DB::transaction(fn () => $krs->mataKuliahs()->syncWithoutDetaching([$request->id_mk]));

        return $this->successMessage('Mata kuliah ditambahkan ke KRS');
    }

    public function removeMataKuliah(int $krsId, int $mkId): JsonResponse
    {
        $krs = Krs::findOrFail($krsId);
        DB::transaction(fn () => $krs->mataKuliahs()->detach($mkId));
        return $this->successMessage('Mata kuliah dihapus dari KRS');
    }
}

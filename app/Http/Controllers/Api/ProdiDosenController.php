<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProdiDosenStoreRequest;
use App\Http\Requests\ProdiDosenUpdateRequest;
use App\Http\Resources\ProdiDosenResource;
use App\Models\ProdiDosen;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProdiDosenController extends Controller
{
    public function index(): JsonResponse
    {
        $prodiDosen = ProdiDosen::query()->orderByDesc('ID_PRODI')->get();

        return $this->successCollection(
            ProdiDosenResource::collection($prodiDosen),
            'Data Prodi Dosen berhasil diambil'
        );
    }

    public function show(int $kode): JsonResponse
    {
        $prodiDosen = ProdiDosen::findOrFail($kode);

        return $this->successResponse(
            new ProdiDosenResource($prodiDosen),
            'Detail Prodi Dosen berhasil diambil'
        );
    }

    public function store(ProdiDosenStoreRequest $request): JsonResponse
    {
        $prodiDosen = DB::transaction(fn () => ProdiDosen::create($request->validated()));

        return $this->successResponse(
            new ProdiDosenResource($prodiDosen),
            'Prodi Dosen berhasil ditambahkan',
            201
        );
    }

    public function update(ProdiDosenUpdateRequest $request, int $kode): JsonResponse
    {
        $prodiDosen = ProdiDosen::findOrFail($kode);
        DB::transaction(fn () => $prodiDosen->update($request->validated()));

        return $this->successResponse(
            new ProdiDosenResource($prodiDosen->fresh()),
            'Prodi Dosen berhasil diperbarui'
        );
    }

    public function destroy(int $kode): JsonResponse
    {
        DB::transaction(fn () => ProdiDosen::findOrFail($kode)->delete());

        return $this->successMessage('Prodi Dosen berhasil dihapus');
    }
}
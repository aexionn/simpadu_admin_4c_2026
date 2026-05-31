<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\KelasMasterStoreRequest;
use App\Http\Requests\KelasMasterUpdateRequest;
use App\Models\KelasMaster;
use App\Http\Resources\KelasMasterResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class KelasMasterController extends Controller
{
    public function index(): JsonResponse
    {
        $data = KelasMaster::with(['kelas', 'tahunAkademik'])
            ->orderByDesc('ID_KELAS_MASTER')
            ->get();

        return $this->successCollection(
            KelasMasterResource::collection($data),
            'Data Kelas Master berhasil diambil'
        );
    }

    public function store(KelasMasterStoreRequest $request): JsonResponse
    {
        $kelasMaster = DB::transaction(fn () => KelasMaster::create($request->validated()));

        return $this->successResponse(
            new KelasMasterResource($kelasMaster->load(['kelas', 'tahunAkademik'])),
            'Kelas Master berhasil ditambahkan',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $kelasMaster = KelasMaster::with(['kelas', 'tahunAkademik', 'presensiMahasiswas'])
            ->findOrFail($id);

        return $this->successResponse(
            new KelasMasterResource($kelasMaster),
            'Detail Kelas Master berhasil diambil'
        );
    }

    public function update(KelasMasterUpdateRequest $request, int $id): JsonResponse
    {
        $kelasMaster = KelasMaster::findOrFail($id);
        DB::transaction(fn () => $kelasMaster->update($request->validated()));

        return $this->successResponse(
            new KelasMasterResource($kelasMaster->fresh()->load(['kelas', 'tahunAkademik'])),
            'Kelas Master berhasil diperbarui'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        DB::transaction(fn () => KelasMaster::findOrFail($id)->delete());

        return $this->successMessage('Kelas Master berhasil dihapus');
    }
}

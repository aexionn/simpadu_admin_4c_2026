<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\KelasMkStoreRequest;
use App\Http\Requests\KelasMkUpdateRequest;
use App\Models\KelasMk;
use App\Http\Resources\KelasMkResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class KelasMkController extends Controller
{
    public function index(): JsonResponse
    {
        $data = KelasMk::with(['kelas', 'kurikulumMk.mataKuliah', 'kurikulumMk.kurikulum'])
            ->orderByDesc('ID_KELAS_MK')
            ->get();

        return $this->successCollection(
            KelasMkResource::collection($data),
            'Data Kelas MK berhasil diambil'
        );
    }

    public function store(KelasMkStoreRequest $request): JsonResponse
    {
        $kelasMk = DB::transaction(fn () => KelasMk::create($request->validated()));

        return $this->successResponse(
            new KelasMkResource($kelasMk->load(['kelas', 'kurikulumMk.mataKuliah', 'kurikulumMk.kurikulum'])),
            'Kelas MK berhasil ditambahkan',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $kelasMk = KelasMk::with(['kelas', 'kurikulumMk.mataKuliah', 'kurikulumMk.kurikulum'])
            ->findOrFail($id);

        return $this->successResponse(
            new KelasMkResource($kelasMk),
            'Detail Kelas MK berhasil diambil'
        );
    }

    public function update(KelasMkUpdateRequest $request, int $id): JsonResponse
    {
        $kelasMk = KelasMk::findOrFail($id);
        DB::transaction(fn () => $kelasMk->update($request->validated()));

        return $this->successResponse(
            new KelasMkResource($kelasMk->fresh()->load(['kelas', 'kurikulumMk.mataKuliah', 'kurikulumMk.kurikulum'])),
            'Kelas MK berhasil diperbarui'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        DB::transaction(fn () => KelasMk::findOrFail($id)->delete());

        return $this->successMessage('Kelas MK berhasil dihapus');
    }
}

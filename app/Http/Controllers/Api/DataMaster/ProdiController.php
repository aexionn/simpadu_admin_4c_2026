<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Http\Requests\proditoreRequest;
use App\Http\Requests\ProdiUpdateRequest;
use App\Http\Resources\ProdiResource;
use App\Models\Prodi;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProdiController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Prodi::with('jurusan')->get();
        return $this->successCollection(ProdiResource::collection($data), 'Data prodi berhasil diambil');
    }

    public function store(proditoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $prodi = DB::transaction(function () use ($validated) {
            return Prodi::create($validated);
        });

        return $this->successResponse(
            new ProdiResource($prodi->fresh()->load('jurusan')),
            'Prodi berhasil ditambahkan',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(
            new ProdiResource(Prodi::with('jurusan')->findOrFail($id)),
            'Detail prodi berhasil diambil'
        );
    }

    public function update(ProdiUpdateRequest $request, int $id): JsonResponse
    {
        $prodi = Prodi::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($prodi, $validated) {
            $prodi->update($validated);
        });

        return $this->successResponse(
            new ProdiResource($prodi->fresh()->load('jurusan')),
            'Prodi berhasil diperbarui'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $prodi = Prodi::findOrFail($id);

        DB::transaction(function () use ($prodi) {
            $prodi->delete();
        });

        return $this->successMessage('Prodi berhasil dihapus');
    }
}

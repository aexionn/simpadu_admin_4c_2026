<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProvinsiStoreRequest;
use App\Http\Requests\ProvinsiUpdateRequest;
use App\Http\Resources\ProvinsiResource;
use App\Models\Provinsi;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProvinsiController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Provinsi::all();

        return $this->successCollection(ProvinsiResource::collection($data), 'Data provinsi berhasil diambil');
    }

    public function store(ProvinsiStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $provinsi = DB::transaction(function () use ($validated) {
            return Provinsi::create($validated);
        });

        return $this->successResponse(new ProvinsiResource($provinsi), 'Provinsi berhasil ditambahkan', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(
            new ProvinsiResource(Provinsi::findOrFail($id)),
            'Detail provinsi berhasil diambil'
        );
    }

    public function update(ProvinsiUpdateRequest $request, int $id): JsonResponse
    {
        $provinsi = Provinsi::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($provinsi, $validated) {
            $provinsi->update($validated);
        });

        return $this->successResponse(new ProvinsiResource($provinsi->fresh()), 'Provinsi berhasil diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        $provinsi = Provinsi::findOrFail($id);

        DB::transaction(function () use ($provinsi) {
            $provinsi->delete();
        });

        return $this->successMessage('Provinsi berhasil dihapus');
    }
}

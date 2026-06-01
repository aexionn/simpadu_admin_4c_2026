<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Http\Requests\HariStoreRequest;
use App\Http\Requests\HariUpdateRequest;
use App\Http\Resources\HariResource;
use App\Models\Hari;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HariController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Hari::all();
        return $this->successCollection(HariResource::collection($data), 'Data hari berhasil diambil');
    }

    public function store(HariStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $hari = DB::transaction(function () use ($validated) {
            return Hari::create($validated);
        });

        return $this->successResponse(new HariResource($hari), 'Hari berhasil ditambahkan', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(new HariResource(Hari::findOrFail($id)), 'Detail hari berhasil diambil');
    }

    public function update(HariUpdateRequest $request, int $id): JsonResponse
    {
        $hari = Hari::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($hari, $validated) {
            $hari->update($validated);
        });

        return $this->successResponse(new HariResource($hari->fresh()), 'Hari berhasil diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        $hari = Hari::findOrFail($id);

        DB::transaction(function () use ($hari) {
            $hari->delete();
        });

        return $this->successMessage('Hari berhasil dihapus');
    }
}

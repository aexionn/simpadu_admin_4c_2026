<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Http\Requests\RuangStoreRequest;
use App\Http\Requests\RuangUpdateRequest;
use App\Http\Resources\RuangResource;
use App\Models\Ruang;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RuangController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Ruang::all();
        return $this->successCollection(RuangResource::collection($data), 'Data ruang berhasil diambil');
    }

    public function store(RuangStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $ruang = DB::transaction(function () use ($validated) {
            return Ruang::create($validated);
        });

        return $this->successResponse(new RuangResource($ruang), 'Ruang berhasil ditambahkan', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(new RuangResource(Ruang::findOrFail($id)), 'Detail ruang berhasil diambil');
    }

    public function update(RuangUpdateRequest $request, int $id): JsonResponse
    {
        $ruang = Ruang::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($ruang, $validated) {
            $ruang->update($validated);
        });

        return $this->successResponse(new RuangResource($ruang->fresh()), 'Ruang berhasil diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        $ruang = Ruang::findOrFail($id);

        DB::transaction(function () use ($ruang) {
            $ruang->delete();
        });

        return $this->successMessage('Ruang berhasil dihapus');
    }
}

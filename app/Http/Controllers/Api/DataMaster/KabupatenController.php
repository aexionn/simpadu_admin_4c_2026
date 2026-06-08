<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Http\Requests\KabupatenStoreRequest;
use App\Http\Requests\KabupatenUpdateRequest;
use App\Http\Resources\KabupatenResource;
use App\Models\Kabupaten;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class KabupatenController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Kabupaten::with('provinsi')->get();

        return $this->successCollection(KabupatenResource::collection($data), 'Data kabupaten berhasil diambil');
    }

    public function store(KabupatenStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $kabupaten = DB::transaction(function () use ($validated) {
            return Kabupaten::create($validated);
        });

        return $this->successResponse(
            new KabupatenResource($kabupaten->fresh()->load('provinsi')),
            'Kabupaten berhasil ditambahkan',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(
            new KabupatenResource(Kabupaten::with('provinsi')->findOrFail($id)),
            'Detail kabupaten berhasil diambil'
        );
    }

    public function update(KabupatenUpdateRequest $request, int $id): JsonResponse
    {
        $kabupaten = Kabupaten::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($kabupaten, $validated) {
            $kabupaten->update($validated);
        });

        return $this->successResponse(
            new KabupatenResource($kabupaten->fresh()->load('provinsi')),
            'Kabupaten berhasil diperbarui'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $kabupaten = Kabupaten::findOrFail($id);

        DB::transaction(function () use ($kabupaten) {
            $kabupaten->delete();
        });

        return $this->successMessage('Kabupaten berhasil dihapus');
    }
}

<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Http\Requests\jurusantoreRequest;
use App\Http\Requests\JurusanUpdateRequest;
use App\Http\Resources\JurusanResource;
use App\Models\Jurusan;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class JurusanController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Jurusan::all();
        return $this->successCollection(JurusanResource::collection($data), 'Data jurusan berhasil diambil');
    }

    public function store(jurusantoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $jurusan = DB::transaction(function () use ($validated) {
            return Jurusan::create($validated);
        });

        return $this->successResponse(new JurusanResource($jurusan), 'Jurusan berhasil ditambahkan', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(new JurusanResource(Jurusan::findOrFail($id)), 'Detail jurusan berhasil diambil');
    }

    public function update(JurusanUpdateRequest $request, int $id): JsonResponse
    {
        $jurusan = Jurusan::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($jurusan, $validated) {
            $jurusan->update($validated);
        });

        return $this->successResponse(new JurusanResource($jurusan->fresh()), 'Jurusan berhasil diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        $jurusan = Jurusan::findOrFail($id);

        DB::transaction(function () use ($jurusan) {
            $jurusan->delete();
        });

        return $this->successMessage('Jurusan berhasil dihapus');
    }
}

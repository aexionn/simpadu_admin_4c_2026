<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Http\Resources\MataKuliahResource;
use App\Models\MataKuliah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MataKuliahController extends Controller
{
    public function index(): JsonResponse
    {
        $data = MataKuliah::all();
        return $this->successCollection(MataKuliahResource::collection($data), 'Data mata kuliah berhasil diambil');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'NAMA_MK'  => 'required|string|max:40',
            'SEMESTER' => 'required|integer|min:1|max:8',
            'SKS'      => 'required|integer|min:1|max:6',
            'JAM'      => 'required|integer|min:1',
        ]);

        $mk = MataKuliah::create($validated);

        return $this->successResponse(new MataKuliahResource($mk), 'Mata kuliah berhasil ditambahkan', 201);
    }

    public function show(int $id): JsonResponse
    {
       return $this->successResponse(new MataKuliahResource(MataKuliah::findOrFail($id)), 'Detail mata kuliah berhasil diambil');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $mk = MataKuliah::findOrFail($id);

        $validated = $request->validate([
            'NAMA_MK'  => 'sometimes|string|max:40',
            'SEMESTER' => 'sometimes|integer|min:1|max:8',
            'SKS'      => 'sometimes|integer|min:1|max:6',
            'JAM'      => 'sometimes|integer|min:1',
        ]);

        $mk->update($validated);

        return $this->successResponse(new MataKuliahResource($mk), 'Mata kuliah berhasil diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        MataKuliah::findOrFail($id)->delete();

        return $this->successMessage('Mata kuliah berhasil dihapus');
    }
}
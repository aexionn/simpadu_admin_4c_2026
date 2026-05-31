<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Models\ProgramKelas;
use App\Http\Resources\ProgramKelasResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramKelasController extends Controller
{
    public function index(): JsonResponse
    {
        $data = ProgramKelas::all();
        return $this->successCollection(ProgramKelasResource::collection($data), 'Data program kelas berhasil diambil');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'NAMA_PROGRAM' => 'required|string|max:20|unique:program_kelas,NAMA_PROGRAM',
            'AKTIF'        => 'required|in:Y,T',
        ]);

        $program = ProgramKelas::create($validated);

        return $this->successResponse(new ProgramKelasResource($mk), 'Program kelas berhasil ditambahkan', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(new ProgramKelasResource(ProgramKelas::findOrFail($id)), 'Detail program kelas berhasil diambil');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $program = ProgramKelas::findOrFail($id);

        $validated = $request->validate([
            'NAMA_PROGRAM' => 'sometimes|string|max:20|unique:program_kelas,NAMA_PROGRAM,' . $id . ',ID_PROGRAM',
            'AKTIF'        => 'sometimes|in:Y,T',
        ]);

        $program->update($validated);

        return $this->successResponse(new ProgramKelasResource($mk), 'Program kelas berhasil diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        ProgramKelas::findOrFail($id)->delete();

        return $this->successMessage('Program kelas berhasil dihapus');
    }
}
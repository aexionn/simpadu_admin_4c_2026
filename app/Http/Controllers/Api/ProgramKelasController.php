<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Models\ProgramKelas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramKelasController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => ProgramKelas::all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'NAMA_PROGRAM' => 'required|string|max:20|unique:program_kelas,NAMA_PROGRAM',
            'AKTIF'        => 'required|in:Y,T',
        ]);

        $program = ProgramKelas::create($validated);

        return response()->json([
            'message' => 'Program kelas created successfully.',
            'data'    => $program,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $program = ProgramKelas::findOrFail($id);

        return response()->json(['data' => $program]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $program = ProgramKelas::findOrFail($id);

        $validated = $request->validate([
            'NAMA_PROGRAM' => 'sometimes|string|max:20|unique:program_kelas,NAMA_PROGRAM,' . $id . ',ID_PROGRAM',
            'AKTIF'        => 'sometimes|in:Y,T',
        ]);

        $program->update($validated);

        return response()->json([
            'message' => 'Program kelas updated successfully.',
            'data'    => $program,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $program = ProgramKelas::findOrFail($id);
        $program->delete();

        return response()->json([
            'message' => 'Program kelas deleted successfully.',
        ]);
    }
}
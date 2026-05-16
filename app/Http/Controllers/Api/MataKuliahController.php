<?php
// app/Http/Controllers/Api/DataMaster/MataKuliahController.php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MataKuliahController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => MataKuliah::all(),
        ]);
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

        return response()->json([
            'message' => 'Mata kuliah created successfully.',
            'data'    => $mk,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $mk = MataKuliah::findOrFail($id);

        return response()->json(['data' => $mk]);
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

        return response()->json([
            'message' => 'Mata kuliah updated successfully.',
            'data'    => $mk,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $mk = MataKuliah::findOrFail($id);
        $mk->delete();

        return response()->json([
            'message' => 'Mata kuliah deleted successfully.',
        ]);
    }
}
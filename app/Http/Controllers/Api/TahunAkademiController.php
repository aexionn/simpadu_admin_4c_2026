<?php
// app/Http/Controllers/Api/DataMaster/TahunAkademikController.php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Models\TahunAkademik;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TahunAkademikController extends Controller
{
    /** List all tahun akademik */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => TahunAkademik::orderByDesc('ID_TAHUN_AKADEMIK')->get(),
        ]);
    }

    /** Create a new tahun akademik */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'NAMA_TAHUN_AKADEMIK' => 'required|string|max:40|unique:tahun_akademik,NAMA_TAHUN_AKADEMIK',
            'AKTIF'               => 'required|in:Y,T',
            'TGL_AWAL_KULIAH'     => 'required|date',
            'TGL_AKHIR_KULIAH'    => 'required|date|after:TGL_AWAL_KULIAH',
        ]);

        $tahun = DB::transaction(function () use ($validated) {
            // If this new record is set active, deactivate all others first
            if ($validated['AKTIF'] === 'Y') {
                TahunAkademik::where('AKTIF', 'Y')->update(['AKTIF' => 'T']);
            }

            return TahunAkademik::create($validated);
        });

        return response()->json([
            'message' => 'Tahun akademik created successfully.',
            'data'    => $tahun,
        ], 201);
    }

    /** Show a single tahun akademik */
    public function show(int $id): JsonResponse
    {
        $tahun = TahunAkademik::findOrFail($id);

        return response()->json(['data' => $tahun]);
    }

    /** Update a tahun akademik */
    public function update(Request $request, int $id): JsonResponse
    {
        $tahun = TahunAkademik::findOrFail($id);

        $validated = $request->validate([
            'NAMA_TAHUN_AKADEMIK' => 'sometimes|string|max:40|unique:tahun_akademik,NAMA_TAHUN_AKADEMIK,' . $id . ',ID_TAHUN_AKADEMIK',
            'AKTIF'               => 'sometimes|in:Y,T',
            'TGL_AWAL_KULIAH'     => 'sometimes|date',
            'TGL_AKHIR_KULIAH'    => 'sometimes|date|after:TGL_AWAL_KULIAH',
        ]);

        DB::transaction(function () use ($tahun, $validated) {
            // If activating this record, deactivate all others
            if (($validated['AKTIF'] ?? null) === 'Y') {
                TahunAkademik::where('AKTIF', 'Y')
                    ->where('ID_TAHUN_AKADEMIK', '!=', $tahun->ID_TAHUN_AKADEMIK)
                    ->update(['AKTIF' => 'T']);
            }

            $tahun->update($validated);
        });

        return response()->json([
            'message' => 'Tahun akademik updated successfully.',
            'data'    => $tahun->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $tahun = TahunAkademik::findOrFail($id);

        // Prevent deleting the currently active tahun akademik
        if ($tahun->AKTIF === 'Y') {
            return response()->json([
                'message' => 'Cannot delete the currently active tahun akademik.',
            ], 422);
        }

        $tahun->delete();

        return response()->json([
            'message' => 'Tahun akademik deleted successfully.',
        ]);
    }
}
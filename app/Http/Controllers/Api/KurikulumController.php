<?php
// app/Http/Controllers/Api/DataMaster/KurikulumController.php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Models\Kurikulum;
use App\Models\TahunAkademik;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KurikulumController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Kurikulum::with('tahunAkademik')
            ->orderByDesc('ID_KURIKULUM')
            ->get()
            ->map(fn($k) => [
                ...$k->toArray(),
                'is_locked' => $k->isLocked(),
            ]);

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ID_TAHUN_AKADEMIK' => 'required|integer|exists:tahun_akademik,ID_TAHUN_AKADEMIK',
            'NAMA_KURIKULUM'    => 'required|string|max:40',
            'CATATAN_KURIKULUM' => 'nullable|string',
            'AKTIF_KURIKULUM'   => 'required|boolean',
        ]);

        $kurikulum = DB::transaction(function () use ($validated) {
            if ($validated['AKTIF_KURIKULUM']) {
                Kurikulum::where('AKTIF_KURIKULUM', true)->update(['AKTIF_KURIKULUM' => false]);
            }

            return Kurikulum::create($validated);
        });

        return response()->json([
            'message' => 'Kurikulum created successfully.',
            'data'    => $kurikulum->load('tahunAkademik'),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $kurikulum = Kurikulum::with('tahunAkademik')->findOrFail($id);

        return response()->json([
            'data'      => $kurikulum,
            'is_locked' => $kurikulum->isLocked(),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $kurikulum = Kurikulum::findOrFail($id);

        if ($kurikulum->isLocked()) {
            return response()->json([
                'message' => 'This kurikulum is locked and cannot be edited because a newer kurikulum is already active.',
            ], 403);
        }

        $validated = $request->validate([
            'ID_TAHUN_AKADEMIK' => 'sometimes|integer|exists:tahun_akademik,ID_TAHUN_AKADEMIK',
            'NAMA_KURIKULUM'    => 'sometimes|string|max:40',
            'CATATAN_KURIKULUM' => 'nullable|string',
            'AKTIF_KURIKULUM'   => 'sometimes|boolean',
        ]);

        DB::transaction(function () use ($kurikulum, $validated) {
            // If activating this kurikulum, deactivate all others first
            if ($validated['AKTIF_KURIKULUM'] ?? false) {
                Kurikulum::where('AKTIF_KURIKULUM', true)
                    ->where('ID_KURIKULUM', '!=', $kurikulum->ID_KURIKULUM)
                    ->update(['AKTIF_KURIKULUM' => false]);
            }

            $kurikulum->update($validated);
        });

        return response()->json([
            'message' => 'Kurikulum updated successfully.',
            'data'    => $kurikulum->fresh()->load('tahunAkademik'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $kurikulum = Kurikulum::findOrFail($id);

        if ($kurikulum->isLocked()) {
            return response()->json([
                'message' => 'This kurikulum is locked and cannot be deleted because a newer kurikulum is already active.',
            ], 403);
        }

        $kurikulum->delete();

        return response()->json([
            'message' => 'Kurikulum deleted successfully.',
        ]);
    }
}
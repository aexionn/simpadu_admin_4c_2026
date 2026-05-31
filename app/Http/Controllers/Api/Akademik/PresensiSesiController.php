<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\PresensiSesiGenerateRequest;
use App\Models\KelasMk;
use App\Models\PresensiSesi;
use App\Http\Resources\PresensiSesiResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PresensiSesiController extends Controller
{
    /**
     * Generate a new dynamic QR attendance session.
     *
     * Creates a time-bound, cryptographically secure token
     * that students scan to submit attendance.
     */
    public function generateSession(PresensiSesiGenerateRequest $request): JsonResponse
    {
        $validated   = $request->validated();
        $idKelasMk   = (int) $validated['ID_KELAS_MK'];
        $pertemuanKe = (int) $validated['PERTEMUAN_KE'];
        $durationMin = (int) ($validated['duration_minutes'] ?? 15);

        // Verify the schedule exists
        KelasMk::findOrFail($idKelasMk);

        // Close any previous active session for the same schedule+meeting
        PresensiSesi::where('ID_KELAS_MK', $idKelasMk)
            ->where('PERTEMUAN_KE', $pertemuanKe)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        $sesi = DB::transaction(fn () => PresensiSesi::create([
            'ID_KELAS_MK'   => $idKelasMk,
            'PERTEMUAN_KE'  => $pertemuanKe,
            'session_token' => Str::random(64),
            'expires_at'    => now()->addMinutes($durationMin),
            'is_active'     => true,
        ]));

        return $this->successResponse(
            new PresensiSesiResource($sesi->load('kelasMk')),
            'Sesi presensi berhasil dibuat.',
            201
        );
    }

    /**
     * Close (deactivate) an active QR session.
     */
    public function closeSession(int $id): JsonResponse
    {
        $sesi = PresensiSesi::findOrFail($id);

        if (! $sesi->is_active) {
            return $this->successMessage('Sesi sudah ditutup sebelumnya.');
        }

        DB::transaction(fn () => $sesi->update(['is_active' => false]));

        return $this->successMessage('Sesi presensi berhasil ditutup.');
    }
}

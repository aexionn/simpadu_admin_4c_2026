<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\PresensiSesiOpenRequest;
use App\Http\Resources\PresensiSesiResource;
use App\Models\KelasMk;
use App\Models\LogAktivitas;
use App\Models\PresensiSesi;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PresensiSesiController extends Controller
{
    public function openSession(PresensiSesiOpenRequest $request): JsonResponse
    {
        $validated   = $request->validated();
        $idKelasMk   = (int) $validated['ID_KELAS_MK'];
        $pertemuanKe = (int) $validated['PERTEMUAN_KE'];
        $durationMin = (int) ($validated['duration_minutes'] ?? 15);

        KelasMk::findOrFail($idKelasMk);

        $sesi = DB::transaction(function () use ($idKelasMk, $pertemuanKe, $durationMin) {
            PresensiSesi::where('ID_KELAS_MK', $idKelasMk)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            $sesi = PresensiSesi::create([
                'ID_KELAS_MK' => $idKelasMk,
                'PERTEMUAN_KE' => $pertemuanKe,
                'expires_at' => now()->addMinutes($durationMin),
                'is_active' => true,
            ]);

            LogAktivitas::create([
                'TIPE_AKTIVITAS' => 'OPEN_PRESENSI_SESSION',
                'PESAN' => "Sesi presensi mahasiswa dibuka untuk kelas_mk {$idKelasMk} pertemuan {$pertemuanKe}.",
                'ENTITAS_TERKAIT' => 'presensi_sesi:' . $sesi->ID_SESI,
            ]);

            return $sesi;
        });

        return $this->successResponse(
            new PresensiSesiResource($sesi->load('kelasMk')),
            'Sesi presensi mahasiswa berhasil dibuka.',
            201
        );
    }

    public function closeSession(int $id): JsonResponse
    {
        $sesi = PresensiSesi::findOrFail($id);

        if (! $sesi->is_active) {
            return $this->successMessage('Sesi sudah ditutup sebelumnya.');
        }

        DB::transaction(function () use ($sesi) {
            $sesi->update(['is_active' => false]);

            LogAktivitas::create([
                'TIPE_AKTIVITAS' => 'CLOSE_PRESENSI_SESSION',
                'PESAN' => "Sesi presensi mahasiswa ditutup untuk ID_SESI {$sesi->ID_SESI}.",
                'ENTITAS_TERKAIT' => 'presensi_sesi:' . $sesi->ID_SESI,
            ]);
        });

        return $this->successMessage('Sesi presensi berhasil ditutup.');
    }
}

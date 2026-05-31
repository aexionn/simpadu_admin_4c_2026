<?php

namespace App\Http\Controllers\Api\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Http\Requests\MahasiswaQrSubmitRequest;
use App\Models\KelasMaster;
use App\Models\PresensiMahasiswa;
use App\Models\PresensiSesi;
use App\Http\Resources\PresensiMahasiswaResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MahasiswaPresensiQrController extends Controller
{
    private const EAGER = ['kelasMaster.kelas', 'kelasMk.kelas'];

    /**
     * Submit attendance by scanning the lecturer's dynamic QR code.
     *
     * Validates the session token (exists, active, not expired),
     * verifies the student is enrolled in the class,
     * prevents duplicate scans, and records the attendance.
     */
    public function submitQrAttendance(MahasiswaQrSubmitRequest $request): JsonResponse
    {
        $token  = $request->validated()['session_token'];
        $nim    = $request->user()->username;   // NIM from JWT-authenticated mahasiswa
        $now    = now();

        // ── Validate session ──────────────────────────────────────────────────
        $sesi = PresensiSesi::with('kelasMk.kelas')
            ->where('session_token', $token)
            ->first();

        if (! $sesi) {
            return $this->errorResponse('Token sesi tidak valid.', 404);
        }

        if (! $sesi->is_active) {
            return $this->errorResponse('Sesi presensi sudah ditutup oleh dosen.', 410);
        }

        if ($sesi->isExpired()) {
            return $this->errorResponse('Sesi presensi sudah kedaluwarsa.', 410);
        }

        $idKelasMk   = $sesi->ID_KELAS_MK;
        $idKelas     = $sesi->kelasMk->ID_KELAS;
        $pertemuanKe = $sesi->PERTEMUAN_KE;

        // ── Verify enrollment ─────────────────────────────────────────────────
        $kelasMaster = KelasMaster::where('NIM', $nim)
            ->where('ID_KELAS', $idKelas)
            ->first();

        if (! $kelasMaster) {
            return $this->errorResponse(
                'Anda tidak terdaftar di kelas ini.',
                403
            );
        }

        // ── Prevent duplicate ─────────────────────────────────────────────────
        $existing = PresensiMahasiswa::where('ID_KELAS_MASTER', $kelasMaster->ID_KELAS_MASTER)
            ->where('ID_SESI', $sesi->ID_SESI)
            ->first();

        if ($existing) {
            return $this->successResponse(
                new PresensiMahasiswaResource($existing->load(self::EAGER)),
                'Anda sudah tercatat hadir pada sesi ini.',
                200
            );
        }

        // ── Record attendance ─────────────────────────────────────────────────
        $presensi = DB::transaction(fn () => PresensiMahasiswa::create([
            'ID_KELAS_MASTER' => $kelasMaster->ID_KELAS_MASTER,
            'ID_KELAS_MK'     => $idKelasMk,
            'ID_SESI'         => $sesi->ID_SESI,
            'NIM'             => $nim,
            'PERTEMUAN_KE'    => $pertemuanKe,
            'STATUS_PRESENSI' => 'H',
            'METODE'          => 'QR_SCAN',
            'WAKTU_PRESENSI'  => $now,
        ]));

        return $this->successResponse(
            new PresensiMahasiswaResource($presensi->load(self::EAGER)),
            'Presensi berhasil dicatat.',
            201
        );
    }
}

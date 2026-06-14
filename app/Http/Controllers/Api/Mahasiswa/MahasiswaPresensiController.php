<?php

namespace App\Http\Controllers\Api\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Http\Requests\MahasiswaPresensiSubmitRequest;
use App\Http\Resources\PresensiMahasiswaResource;
use App\Http\Resources\PresensiSesiResource;
use App\Models\LogAktivitas;
use App\Models\PresensiMahasiswa;
use App\Models\PresensiSesi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MahasiswaPresensiController extends Controller
{
    public function available(Request $request): JsonResponse
    {
        if (! $request->user()?->hasRole('mahasiswa')) {
            return $this->errorResponse('Hanya mahasiswa yang dapat melihat sesi presensi tersedia.', 403);
        }

        $sessions = PresensiSesi::with('kelasMk')
            ->where('is_active', true)
            ->where('expires_at', '>=', now())
            ->orderByDesc('ID_SESI')
            ->get();

        return $this->successCollection(
            PresensiSesiResource::collection($sessions),
            'Data sesi presensi aktif berhasil diambil'
        );
    }

    public function submit(MahasiswaPresensiSubmitRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (! $request->user()?->hasRole('mahasiswa')) {
            return $this->errorResponse('Hanya mahasiswa yang dapat melakukan presensi mandiri.', 403);
        }

        $idKelasMaster = (int) $validated['id_kelas_master'];
        $idKelasMk = (int) $validated['id_kelas_mk'];
        $nim = (string) $validated['nim'];
        $pertemuanKe = (int) $validated['pertemuan_ke'];

        $session = PresensiSesi::where('ID_KELAS_MK', $idKelasMk)
            ->where('PERTEMUAN_KE', $pertemuanKe)
            ->orderByDesc('ID_SESI')
            ->first();

        if (! $session) {
            return $this->errorResponse('Sesi presensi tidak ditemukan.', 404);
        }

        if (! $session->is_active) {
            return $this->errorResponse('Sesi presensi sudah ditutup.', 410);
        }

        if ($session->isExpired()) {
            return $this->errorResponse('Sesi presensi sudah kedaluwarsa.', 410);
        }

        $presensi = PresensiMahasiswa::where('ID_KELAS_MASTER', $idKelasMaster)
            ->where('ID_KELAS_MK', $idKelasMk)
            ->where('PERTEMUAN_KE', $pertemuanKe)
            ->where('NIM', $nim)
            ->first();

        if (! $presensi) {
            return $this->errorResponse(
                'Data presensi mahasiswa belum dibuat untuk sesi ini. Silakan buka sesi terlebih dahulu.',
                404
            );
        }

        if ($presensi->STATUS_PRESENSI === 'H') {
            return $this->successResponse(
                new PresensiMahasiswaResource($presensi),
                'Anda sudah tercatat hadir pada pertemuan ini.',
                200
            );
        }

        DB::transaction(function () use ($presensi, $idKelasMk, $pertemuanKe, $session, $nim) {
            $presensi->update([
                'STATUS_PRESENSI' => 'H',
                'METODE' => 'Manual',
                'ID_SESI' => $session->ID_SESI,
                'WAKTU_PRESENSI' => now(),
            ]);

            LogAktivitas::create([
                'TIPE_AKTIVITAS' => 'SUBMIT_PRESENSI_MANDIRI',
                'PESAN' => "Status presensi mahasiswa NIM {$nim} diperbarui menjadi H melalui submit mandiri untuk kelas_mk {$idKelasMk} pertemuan {$pertemuanKe}.",
                'ENTITAS_TERKAIT' => 'presensi_mahasiswa:' . $presensi->ID_PRESENSI,
            ]);
        });

        return $this->successResponse(
            new PresensiMahasiswaResource($presensi->fresh()),
            'Presensi berhasil diperbarui menjadi hadir.',
            200
        );
    }
}

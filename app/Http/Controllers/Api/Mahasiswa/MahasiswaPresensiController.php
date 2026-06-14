<?php

namespace App\Http\Controllers\Api\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Http\Requests\MahasiswaPresensiSubmitRequest;
use App\Http\Resources\PresensiMahasiswaResource;
use App\Http\Resources\PresensiSesiResource;
use App\Models\KelasMaster;
use App\Models\KelasMk;
use App\Models\LogAktivitas;
use App\Models\PresensiMahasiswa;
use App\Models\PresensiSesi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MahasiswaPresensiController extends Controller
{
    private const EAGER = ['kelasMaster.kelas', 'kelasMk.kelas', 'presensiSesi'];

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

        $kelasMk = KelasMk::findOrFail($idKelasMk);
        $kelasMaster = KelasMaster::findOrFail($idKelasMaster);

        if ((string) $kelasMaster->NIM !== $nim) {
            return $this->errorResponse('Data mahasiswa tidak sesuai dengan kelas.', 403);
        }

        if ((int) $kelasMaster->ID_KELAS !== (int) $kelasMk->ID_KELAS) {
            return $this->errorResponse('Mahasiswa tidak terdaftar pada kelas ini.', 403);
        }

        $now = now();

        [$presensi, $message, $status] = DB::transaction(function () use ($kelasMaster, $idKelasMk, $pertemuanKe, $session, $nim, $now) {
            $existing = PresensiMahasiswa::where('ID_KELAS_MASTER', $kelasMaster->ID_KELAS_MASTER)
                ->where('ID_KELAS_MK', $idKelasMk)
                ->where('PERTEMUAN_KE', $pertemuanKe)
                ->first();

            if ($existing && $existing->STATUS_PRESENSI === 'H') {
                return [$existing, 'Anda sudah tercatat hadir pada pertemuan ini.', 200];
            }

            if ($existing) {
                $existing->update([
                    'STATUS_PRESENSI' => 'H',
                    'METODE' => 'Manual',
                    'WAKTU_PRESENSI' => $now,
                    'ID_SESI' => $session->ID_SESI,
                ]);

                LogAktivitas::create([
                    'TIPE_AKTIVITAS' => 'SUBMIT_PRESENSI_MANDIRI',
                    'PESAN' => "Status presensi mahasiswa NIM {$nim} diperbarui menjadi H melalui submit mandiri untuk kelas_mk {$idKelasMk} pertemuan {$pertemuanKe}.",
                    'ENTITAS_TERKAIT' => 'presensi_mahasiswa:' . $existing->ID_PRESENSI,
                ]);

                return [$existing, 'Presensi berhasil diperbarui menjadi hadir.', 200];
            }

            $presensi = PresensiMahasiswa::create([
                'ID_KELAS_MASTER' => $kelasMaster->ID_KELAS_MASTER,
                'ID_KELAS_MK' => $idKelasMk,
                'ID_SESI' => $session->ID_SESI,
                'NIM' => $nim,
                'PERTEMUAN_KE' => $pertemuanKe,
                'STATUS_PRESENSI' => 'H',
                'METODE' => 'Manual',
                'WAKTU_PRESENSI' => $now,
            ]);

            LogAktivitas::create([
                'TIPE_AKTIVITAS' => 'SUBMIT_PRESENSI_MANDIRI',
                'PESAN' => "Mahasiswa NIM {$nim} melakukan presensi mandiri untuk kelas_mk {$idKelasMk} pertemuan {$pertemuanKe}.",
                'ENTITAS_TERKAIT' => 'presensi_mahasiswa:' . $presensi->ID_PRESENSI,
            ]);

            return [$presensi, 'Presensi berhasil dicatat.', 201];
        });

        return $this->successResponse(
            new PresensiMahasiswaResource($presensi->fresh()->load(self::EAGER)),
            $message,
            $status
        );
    }
}

<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\PresensiMahasiswaBatchStoreRequest;
use App\Http\Requests\PresensiMahasiswaUpdateRequest;
use App\Models\LogAktivitas;
use App\Models\PresensiMahasiswa;
use App\Http\Resources\PresensiMahasiswaResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PresensiMahasiswaController extends Controller
{
    // private const EAGER = [
    //     'kelasMaster.kelas', 'kelasMaster.tahunAkademik',
    //     'kelasMk.kelas', 'kelasMk.kurikulumMk.mataKuliah',
    //     'presensiSesi',
    // ];

    public function index(): JsonResponse
    {
        $presensi = PresensiMahasiswa::orderByDesc('ID_PRESENSI')
            ->get();

        return $this->successCollection(
            PresensiMahasiswaResource::collection($presensi),
            'Data Presensi Mahasiswa berhasil diambil'
        );
    }

    public function show(int $id): JsonResponse
    {
        $presensi = PresensiMahasiswa::findOrFail($id);

        return $this->successResponse(
            new PresensiMahasiswaResource($presensi),
            'Detail Presensi Mahasiswa berhasil diambil'
        );
    }

    /**
     * Update an attendance record — restricted to admin roles.
     *
     * If STATUS_PRESENSI is changed, an append-only audit log entry
     * is created in the `log` table inside the same DB transaction.
     */
    public function update(PresensiMahasiswaUpdateRequest $request, int $id): JsonResponse
    {
        $presensi = PresensiMahasiswa::findOrFail($id);
        $oldStatus = $presensi->STATUS_PRESENSI;
        $validated = $request->validated();
        $newStatus = $validated['STATUS_PRESENSI'] ?? $oldStatus;

        DB::transaction(function () use ($presensi, $validated, $oldStatus, $newStatus) {
            $presensi->update($validated);

            // Append-only audit log when status changes
            if ($oldStatus !== $newStatus) {
                LogAktivitas::create([
                    'TIPE_AKTIVITAS'  => 'UPDATE_PRESENSI',
                    'PESAN'           => sprintf(
                        'Status presensi NIM %s diubah dari %s ke %s',
                        $presensi->NIM,
                        $oldStatus ?? '-',
                        $newStatus
                    ),
                    'ENTITAS_TERKAIT' => 'presensi_mahasiswa:' . $presensi->ID_PRESENSI,
                ]);
            }
        });

        return $this->successResponse(
            new PresensiMahasiswaResource($presensi->fresh()),
            'Presensi Mahasiswa berhasil diperbarui'
        );
    }

    /**
     * Get generated attendance rows for a specific meeting.
     *
     * Query parameters:
     * - id_kelas_mk  (required, integer, exists:kelas_mk,ID_KELAS_MK)
     * - pertemuan_ke (required, integer, min:1)
     */
    public function getRoster(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_kelas_mk'  => 'required|integer|exists:kelas_mk,ID_KELAS_MK',
            'pertemuan_ke' => 'required|integer|min:1',
        ]);

        $idKelasMk   = (int) $validated['id_kelas_mk'];
        $pertemuanKe = (int) $validated['pertemuan_ke'];

        $roster = PresensiMahasiswa::where('ID_KELAS_MK', $idKelasMk)
            ->where('PERTEMUAN_KE', $pertemuanKe)
            ->orderBy('ID_KELAS_MASTER')
            ->get()
            ->map(fn (PresensiMahasiswa $presensi) => [
                'id_presensi'      => $presensi->ID_PRESENSI,
                'id_kelas_master'  => $presensi->ID_KELAS_MASTER,
                'id_kelas_mk'      => $presensi->ID_KELAS_MK,
                'id_sesi'          => $presensi->ID_SESI,
                'nim'              => $presensi->NIM,
                'pertemuan_ke'     => $presensi->PERTEMUAN_KE,
                'status_presensi'  => $presensi->STATUS_PRESENSI,
                'metode'           => $presensi->METODE,
                'waktu_presensi'   => $presensi->WAKTU_PRESENSI?->toDateTimeString(),
            ]);

        return $this->successResponse($roster, 'Data roster berhasil diambil');
    }

    /**
     * Submit a batch of manual roll-call attendance records.
     *
     * Uses upsert: creates or updates records keyed by
     * (ID_KELAS_MASTER, ID_KELAS_MK, PERTEMUAN_KE).
     * All executed in a single atomic transaction.
     */
    public function submitBatchRollCall(PresensiMahasiswaBatchStoreRequest $request): JsonResponse
    {
        $rows = $request->input('presensi');

        DB::transaction(function () use ($rows) {
            $now = now();

            $payload = array_map(fn (array $r) => [
                'ID_KELAS_MASTER' => $r['id_kelas_master'],
                'ID_KELAS_MK'     => $r['id_kelas_mk'],
                'NIM'             => $r['nim'],
                'PERTEMUAN_KE'    => $r['pertemuan_ke'],
                'STATUS_PRESENSI' => $r['status_presensi'],
                'METODE'          => 'Manual',
                'WAKTU_PRESENSI'  => $now,
            ], $rows);

            PresensiMahasiswa::upsert(
                $payload,
                ['ID_KELAS_MASTER', 'ID_KELAS_MK', 'PERTEMUAN_KE'],
                ['STATUS_PRESENSI', 'METODE', 'WAKTU_PRESENSI']
            );
        });

        return $this->successMessage(
            'Batch presensi berhasil disimpan (' . count($rows) . ' data).',
            201
        );
    }
}

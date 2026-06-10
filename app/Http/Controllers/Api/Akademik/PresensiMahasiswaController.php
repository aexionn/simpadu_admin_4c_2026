<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\PresensiMahasiswaBatchStoreRequest;
use App\Http\Requests\PresensiMahasiswaUpdateRequest;
use App\Models\KelasMaster;
use App\Models\KelasMk;
use App\Models\LogAktivitas;
use App\Models\PresensiMahasiswa;
use App\Models\User;
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
     * Get the class roster with current attendance status for a specific meeting.
     *
     * Used by the Manual Roll Call UI. Returns every enrolled student along
     * with their attendance status (null if not yet recorded).
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

        // 1. Find KelasMk to get the ID_KELAS
        $kelasMk = KelasMk::findOrFail($idKelasMk);

        // 2. Fetch all enrolled students (KelasMaster) for that class
        $kelasMasterList = KelasMaster::where('ID_KELAS', $kelasMk->ID_KELAS)
            ->orderBy('NO_ABSEN')
            ->get();

        // 3. Fetch existing attendance records for this meeting
        $presensiList = PresensiMahasiswa::where('ID_KELAS_MK', $idKelasMk)
            ->where('PERTEMUAN_KE', $pertemuanKe)
            ->get()
            ->keyBy('ID_KELAS_MASTER');

        // 4. Batch-load student names via their primary keys
        $userIds = $kelasMasterList->pluck('NIM')->filter()->unique()->values()->toArray();
        $users   = User::whereIn('id_user', $userIds)->get()->keyBy('id_user');

        // 5. Build the roster
        $roster = $kelasMasterList->map(function (KelasMaster $km) use ($presensiList, $users) {
            $presensi = $presensiList->get($km->ID_KELAS_MASTER);

            return [
                'id_kelas_master' => $km->ID_KELAS_MASTER,
                'nim'             => $km->NIM,
                'nama_mahasiswa'  => $users->get($km->NIM)?->name,
                'status_presensi' => $presensi?->STATUS_PRESENSI,
                'metode'          => $presensi?->METODE,
            ];
        });

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

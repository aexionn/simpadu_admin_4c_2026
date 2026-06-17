<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PresensiPegawaiStoreRequest;
use App\Http\Requests\PresensiPegawaiUpdateRequest;
use App\Http\Resources\PresensiPegawaiResource;
use App\Models\PresensiPegawai;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PresensiPegawaiController extends Controller
{
    // ═══════════════════════════════════════════════════════════════════════════
    // Identity Resolution
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // All attendance operations are keyed by `id_user` (FK to users.id_user).
    //
    // Two modes:
    //   - Employee self-service: authenticated user can only clock themselves.
    //   - Admin override: super_admin / admin_akademik can pass `id_user` in
    //     the request to act on behalf of another employee.
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Resolve the target user ID for attendance operations.
     *
     * Admins may override via request body/query `id_user`.
     * Normal users are strictly locked to their own authenticated ID.
     */
    private function getTargetUserId(Request $request): int
    {
        if ($this->isAdmin($request) && $request->filled('id_user')) {
            return (int) $request->input('id_user');
        }

        return (int) $request->user()->id_user;
    }

    /**
     * Check if the authenticated user has an admin-type role.
     */
    private function isAdmin(Request $request): bool
    {
        $user = $request->user();
        if (!$user) {
            return false;
        }

        return $user->hasRole('super_admin') || $user->hasRole('admin_akademik');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CRUD
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * List attendance records.
     * - Admin: sees all, can filter by `id_user`.
     * - Pegawai: sees only own records.
     */
    public function index(Request $request): JsonResponse
    {
        $query = PresensiPegawai::with('user')->orderByDesc('TANGGAL');

        if ($this->isAdmin($request)) {
            if ($request->filled('id_user')) {
                $query->where('id_user', (int) $request->input('id_user'));
            }
        } else {
            $query->where('id_user', $request->user()->id_user);
        }

        $data = $query->get();

        return $this->successCollection(
            PresensiPegawaiResource::collection($data),
            'Data presensi pegawai berhasil diambil'
        );
    }

    /**
     * Create a manual attendance entry (Izin, Sakit, Alpha, etc.).
     * Only accessible by admin roles.
     */
    public function store(PresensiPegawaiStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $presensi = DB::transaction(function () use ($validated) {
            return PresensiPegawai::create($validated);
        });

        return $this->successResponse(
            new PresensiPegawaiResource($presensi->load('user')),
            'Presensi pegawai berhasil ditambahkan',
            201
        );
    }

    /**
     * Show a single attendance record.
     *
     * Non-admin users can only view their own records (IDOR protection).
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $presensi = PresensiPegawai::findOrFail($id);

        // IDOR guard: non-admin can only view own records
        if (!$this->isAdmin($request) && $presensi->ID_USER !== $request->user()->id_user) {
            return $this->errorResponse('Anda tidak memiliki akses ke data ini.', 403);
        }

        return $this->successResponse(
            new PresensiPegawaiResource($presensi->load('user')),
            'Detail presensi pegawai berhasil diambil'
        );
    }

    /**
     * Update an existing attendance record.
     * Only accessible by admin roles.
     */
    public function update(PresensiPegawaiUpdateRequest $request, int $id): JsonResponse
    {
        $presensi  = PresensiPegawai::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($presensi, $validated) {
            $presensi->update($validated);
        });

        return $this->successResponse(
            new PresensiPegawaiResource($presensi->fresh()->load('user')),
            'Presensi pegawai berhasil diperbarui'
        );
    }

    /**
     * Delete an attendance record.
     * Only accessible by admin roles.
     */
    public function destroy(int $id): JsonResponse
    {
        $presensi = PresensiPegawai::findOrFail($id);

        DB::transaction(function () use ($presensi) {
            $presensi->delete();
        });

        return $this->successMessage('Presensi pegawai berhasil dihapus');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Custom Attendance Actions
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Clock-in (Masuk).
     *
     * - Derives `id_user` from the authenticated token (or admin override).
     * - Automatically sets TANGGAL = today, WAKTU_MASUK = current server time.
     * - Defaults STATUS_PRESENSI to 'H' (Hadir).
     * - If a record already exists for this user + today, upgrades it to
     *   Hadir with the current time (handles the case where an Izin/Sakit
     *   record was created manually earlier but the employee showed up).
     * - Returns 409 if WAKTU_MASUK is already filled for today.
     */
    public function masuk(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);
        $today  = Carbon::today()->toDateString();
        $now    = Carbon::now()->format('H:i:s');

        $presensi = DB::transaction(function () use ($userId, $today, $now) {
            $existing = PresensiPegawai::where('ID_USER', $userId)
                ->whereDate('TANGGAL', $today)
                ->first();

            if ($existing) {
                if ($existing->WAKTU_MASUK) {
                    return [
                        'status'  => 409,
                        'message' => 'Sudah presensi masuk hari ini',
                        'data'    => $existing,
                    ];
                }

                // Existing record without clock-in time (e.g. manual Izin/Sakit)
                // — upgrade to Hadir and record the entry time
                $existing->update([
                    'STATUS_PRESENSI' => 'H',
                    'WAKTU_MASUK'     => $now,
                ]);

                return [
                    'status'  => 200,
                    'message' => 'Presensi masuk berhasil (status diperbarui menjadi Hadir)',
                    'data'    => $existing,
                ];
            }

            // Fresh clock-in
            $created = PresensiPegawai::create([
                'ID_USER'         => $userId,
                'STATUS_PRESENSI' => 'H',
                'WAKTU_MASUK'     => $now,
                'TANGGAL'         => $today,
            ]);

            return [
                'status'  => 201,
                'message' => 'Presensi masuk berhasil',
                'data'    => $created,
            ];
        });

        if ($presensi['status'] === 409) {
            return $this->errorResponse($presensi['message'], 409);
        }

        return $this->successResponse(
            new PresensiPegawaiResource($presensi['data']->load('user')),
            $presensi['message'],
            $presensi['status']
        );
    }

    /**
     * Clock-out (Keluar).
     *
     * - Automatically sets WAKTU_KELUAR = current server time.
     * - Requires an existing record for this user + today with WAKTU_MASUK set.
     * - Returns 409 if already clocked out, 404 if no clock-in today.
     */
    public function keluar(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);
        $today  = Carbon::today()->toDateString();
        $now    = Carbon::now()->format('H:i:s');

        $result = DB::transaction(function () use ($userId, $today, $now) {
            $presensi = PresensiPegawai::where('id_user', $userId)
                ->whereDate('TANGGAL', $today)
                ->first();

            if (!$presensi) {
                return [
                    'status'  => 404,
                    'message' => 'Belum ada presensi masuk hari ini',
                ];
            }

            if ($presensi->WAKTU_KELUAR) {
                return [
                    'status'  => 409,
                    'message' => 'Sudah presensi keluar hari ini',
                    'data'    => $presensi,
                ];
            }

            $presensi->update(['WAKTU_KELUAR' => $now]);

            return [
                'status'  => 200,
                'message' => 'Presensi keluar berhasil',
                'data'    => $presensi,
            ];
        });

        if ($result['status'] === 404) {
            return $this->errorResponse($result['message'], 404);
        }

        if ($result['status'] === 409) {
            return $this->errorResponse($result['message'], 409);
        }

        return $this->successResponse(
            new PresensiPegawaiResource($result['data']->load('user')),
            $result['message']
        );
    }

    /**
     * Get today's attendance record for the resolved user.
     */
    public function hariIni(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);
        $today  = Carbon::today()->toDateString();

        $presensi = PresensiPegawai::where('id_user', $userId)
            ->whereDate('TANGGAL', $today)
            ->first();

        if (!$presensi) {
            return $this->successResponse(null, 'Belum ada presensi hari ini');
        }

        return $this->successResponse(
            new PresensiPegawaiResource($presensi->load('user')),
            'Presensi hari ini berhasil diambil'
        );
    }

    /**
     * Recap / attendance history.
     *
     * - Non-admin: strictly scoped to own `id_user`.
     * - Admin: can optionally pass `?id_user=X` to view another employee.
     *
     * Filters (all optional query params):
     *   - id_user         (int)      — admin override target user
     *   - bulan           (int 1-12) — filter by month
     *   - tanggal_mulai   (Y-m-d)    — start date (inclusive)
     *   - tanggal_selesai (Y-m-d)    — end date (inclusive)
     */
    public function rekap(Request $request): JsonResponse
    {
        $userId = $this->isAdmin($request) && $request->filled('id_user')
            ? (int) $request->input('id_user')
            : $request->user()->id_user;

        $query = PresensiPegawai::with('user')->where('id_user', $userId);

        if ($request->filled('bulan')) {
            $query->whereMonth('TANGGAL', $request->integer('bulan'));
        }

        if ($request->filled('tanggal_mulai')) {
            $startDate = \Carbon\Carbon::parse($request->input('tanggal_mulai'))->startOfDay();
            $query->where('TANGGAL', '>=', $startDate);
        }

        if ($request->filled('tanggal_selesai')) {
            $endDate = \Carbon\Carbon::parse($request->input('tanggal_selesai'))->endOfDay();
            $query->where('TANGGAL', '<=', $endDate);
        }

        $data = $query->orderByDesc('TANGGAL')->get();

        return $this->successCollection(
            PresensiPegawaiResource::collection($data),
            'Rekap presensi berhasil diambil'
        );
    }
}

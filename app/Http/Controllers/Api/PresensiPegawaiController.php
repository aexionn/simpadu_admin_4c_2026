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
    // Two modes:
    //   1. Admin / Kiosk — sends `NIP` in the request body to act on behalf
    //      of an employee.
    //   2. Employee self-service — authenticated user's identity determines
    //      their NIP. Falls back to `$user->nip` attribute if present.
    //
    // NOTE: For employee self-service to work without explicitly sending NIP,
    //       the `users` table should have a `nip` column, or a `Pegawai`
    //       relationship should be established. If neither exists, the
    //       employee MUST include their own NIP in the request body.
    // ═══════════════════════════════════════════════════════════════════════════

    private function resolveNip(Request $request): string
    {
        // Mode 1: Explicit NIP in request body (admin / kiosk / self-service)
        if ($request->filled('NIP')) {
            return $request->input('NIP');
        }

        // Mode 2: Resolve NIP from external pegawai microservice
        $user = $request->user();

        if ($user) {
            try {
                $pegawaiService = app(\App\Services\PegawaiClientService::class);

                // Try by user ID first, fall back to email
                $nip = $pegawaiService->getNipByUserId($user->getKey())
                    ?? $pegawaiService->getNipByEmail($user->email);

                if ($nip) {
                    return $nip;
                }
            } catch (\Exception $e) {
                // Service unavailable — fall through to explicit error
            }
        }

        abort(422, 'NIP tidak dapat ditentukan. Kirimkan NIP dalam request body.');
    }

    /**
     * Check if the authenticated user is an admin-type role.
     */
    private function isAdmin(Request $request): bool
    {
        $user = $request->user();
        if (!$user) {
            return false;
        }

        return $user->hasRole('super_admin') || $user->hasRole('admin_akademik');
    }

    /**
     * List all presensi records.
     * - Admin: sees all records.
     * - Pegawai: sees only own records (filtered by resolved NIP).
     */
    public function index(Request $request): JsonResponse
    {
        $query = PresensiPegawai::query()->orderByDesc('TANGGAL');

        if (!$this->isAdmin($request)) {
            // Non-admin users see only their own attendance
            $query->where('NIP', $this->resolveNip($request));
        } else {
            // Admin can optionally filter by NIP
            if ($request->filled('NIP')) {
                $query->where('NIP', $request->input('NIP'));
            }
        }

        $data = $query->get();

        return $this->successCollection(
            PresensiPegawaiResource::collection($data),
            'Data presensi pegawai berhasil diambil'
        );
    }

    /**
     * Create a manual attendance entry (e.g. Izin, Sakit, Alpha).
     * Only accessible by admin roles.
     */
    public function store(PresensiPegawaiStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $presensi = DB::transaction(function () use ($validated) {
            return PresensiPegawai::create($validated);
        });

        return $this->successResponse(
            new PresensiPegawaiResource($presensi),
            'Presensi pegawai berhasil ditambahkan',
            201
        );
    }

    /**
     * Show a single presensi record.
     */
    public function show(int $id): JsonResponse
    {
        return $this->successResponse(
            new PresensiPegawaiResource(PresensiPegawai::findOrFail($id)),
            'Detail presensi pegawai berhasil diambil'
        );
    }

    /**
     * Update an existing attendance record.
     * Only accessible by admin roles.
     */
    public function update(PresensiPegawaiUpdateRequest $request, int $id): JsonResponse
    {
        $presensi = PresensiPegawai::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($presensi, $validated) {
            $presensi->update($validated);
        });

        return $this->successResponse(
            new PresensiPegawaiResource($presensi->fresh()),
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

    /**
     * Clock-in (Masuk).
     *
     * - Automatically sets TANGGAL = today, WAKTU_MASUK = current server time.
     * - Defaults STATUS_PRESENSI to 'H' (Hadir).
     * - If a record already exists for this NIP + today, update it to 'H'
     *   and set WAKTU_MASUK (handles case where an Izin/Sakit record was
     *   created manually earlier in the day but the employee showed up).
     * - Returns 409 if WAKTU_MASUK is already filled for today.
     */
    public function masuk(Request $request): JsonResponse
    {
        $nip    = $this->resolveNip($request);
        $today  = Carbon::today()->toDateString();
        $now    = Carbon::now()->format('H:i:s');

        $presensi = DB::transaction(function () use ($nip, $today, $now) {
            $existing = PresensiPegawai::where('NIP', $nip)
                ->whereDate('TANGGAL', $today)
                ->first();

            if ($existing) {
                // Already clocked in today
                if ($existing->WAKTU_MASUK) {
                    // Return conflict — don't overwrite an existing clock-in time
                    return [
                        'status'  => 409,
                        'message' => 'Sudah presensi masuk hari ini',
                        'data'    => $existing,
                    ];
                }

                // Record exists (e.g. created manually as Izin/Sakit/Alpha)
                // but employee showed up — upgrade to Hadir with clock-in time
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

            // Fresh clock-in record
            $created = PresensiPegawai::create([
                'NIP'             => $nip,
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
            new PresensiPegawaiResource($presensi['data']),
            $presensi['message'],
            $presensi['status']
        );
    }

    /**
     * Clock-out (Keluar).
     *
     * - Automatically sets WAKTU_KELUAR = current server time.
     * - Requires an existing record for this NIP + today with WAKTU_MASUK filled.
     * - Returns 409 if already clocked out today.
     * - Returns 404 if no clock-in record exists for today.
     */
    public function keluar(Request $request): JsonResponse
    {
        $nip   = $this->resolveNip($request);
        $today = Carbon::today()->toDateString();
        $now   = Carbon::now()->format('H:i:s');

        $result = DB::transaction(function () use ($nip, $today, $now) {
            $presensi = PresensiPegawai::where('NIP', $nip)
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
            new PresensiPegawaiResource($result['data']),
            $result['message']
        );
    }

    /**
     * Get today's attendance record for the resolved NIP.
     */
    public function hariIni(Request $request): JsonResponse
    {
        $nip   = $this->resolveNip($request);
        $today = Carbon::today()->toDateString();

        $presensi = PresensiPegawai::where('NIP', $nip)
            ->whereDate('TANGGAL', $today)
            ->first();

        if (!$presensi) {
            return $this->successResponse(null, 'Belum ada presensi hari ini');
        }

        return $this->successResponse(
            new PresensiPegawaiResource($presensi),
            'Presensi hari ini berhasil diambil'
        );
    }

    /**
     * Recap / attendance history.
     *
     * - Non-admin: automatically scoped to own NIP.
     * - Admin: can optionally pass `NIP` query param to view another employee.
     *
     * Filters (all optional):
     *   - bulan          (int, 1-12)  — filter by month
     *   - tanggal_mulai  (Y-m-d)      — start date (inclusive)
     *   - tanggal_selesai (Y-m-d)     — end date (inclusive)
     */
    public function rekap(Request $request): JsonResponse
    {
        $nip = $this->resolveNip($request);

        // Admins can override NIP via query parameter to view others' history
        if ($this->isAdmin($request) && $request->filled('NIP')) {
            $nip = $request->input('NIP');
        }

        $query = PresensiPegawai::where('NIP', $nip);

        // Optional filters
        if ($request->filled('bulan')) {
            $query->whereMonth('TANGGAL', $request->integer('bulan'));
        }

        if ($request->filled('tanggal_mulai')) {
            $query->whereDate('TANGGAL', '>=', $request->input('tanggal_mulai'));
        }

        if ($request->filled('tanggal_selesai')) {
            $query->whereDate('TANGGAL', '<=', $request->input('tanggal_selesai'));
        }

        $data = $query->orderByDesc('TANGGAL')->get();

        return $this->successCollection(
            PresensiPegawaiResource::collection($data),
            'Rekap presensi berhasil diambil'
        );
    }
}

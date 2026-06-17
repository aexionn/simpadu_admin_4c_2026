<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Models\TahunAkademik;
use App\Http\Requests\TahunAkademikUpdateRequest;
use App\Http\Resources\TahunAkademikResource;
use App\Services\ActivateToggle;
use App\Services\TahunAkademikIdGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TahunAkademikController extends Controller
{
    public function __construct(
        protected ActivateToggle $toggle,
        protected TahunAkademikIdGenerator $idGenerator,
    ) {}

    /**
     * Display all academic years.
     *
     * Returns a list of all academic year records ordered by the newest ID first.
     */
    public function index(): JsonResponse
    {
        $data = TahunAkademik::orderByDesc('ID_TAHUN_AKADEMIK')->get();

        return $this->successCollection(
            TahunAkademikResource::collection($data),
            'Data tahun akademik berhasil diambil'
        );
    }

    /**
     * Display the active academic year.
     *
     * Returns the academic year where `AKTIF = Y`.
     * If no active academic year is found, all academic year records will be returned as a fallback.
     */
    public function active(): JsonResponse
    {
        $tahun = TahunAkademik::where('AKTIF', 'Y')->first();

        if ($tahun) {
            return $this->successResponse(
                new TahunAkademikResource($tahun),
                'Data tahun akademik aktif berhasil diambil'
            );
        }

        $data = TahunAkademik::orderByDesc('ID_TAHUN_AKADEMIK')->get();

        return $this->successCollection(
            TahunAkademikResource::collection($data),
            'Data tahun akademik aktif tidak ditemukan, seluruh data tahun akademik ditampilkan'
        );
    }

    /**
     * Store a new academic year.
     *
     * Creates a new academic year record. If `AKTIF = Y` is provided, this record becomes the only active academic year.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ID_TAHUN_AKADEMIK'   => 'required|string|max:31',
            'NAMA_TAHUN_AKADEMIK' => 'required|string|max:40|unique:tahun_akademik,NAMA_TAHUN_AKADEMIK',
            'AKTIF'               => 'required|in:Y,T',
            'TGL_AWAL_KULIAH'     => 'required|date_format:Y-m-d',
            'TGL_AKHIR_KULIAH'    => 'required|date_format:Y-m-d|after:TGL_AWAL_KULIAH',
        ]);

        // Generate the next ID before creating the record.

        $tahun = DB::transaction(function () use ($validated) {
            // Create as inactive first to avoid a transient "two active rows" state.
            $shouldActivate = $validated['AKTIF'] === 'Y';
            if ($shouldActivate) {
                $validated['AKTIF'] = 'T';
            }
            $validated['ID_TAHUN_AKADEMIK'] = $this->idGenerator->next();
            $tahun = TahunAkademik::create($validated);

            if ($shouldActivate) {
                $this->toggle->activateExclusive($tahun, 'AKTIF');
            }

            return $tahun;
        });

        return $this->successResponse(new TahunAkademikResource($tahun->fresh()), 'Tahun akademik berhasil ditambahkan', 201);
    }

    /**
     * Display a specific academic year.
     *
     * Returns the detail of one academic year by `ID_TAHUN_AKADEMIK`.
     */
    public function show(int $id): JsonResponse
    {
        return $this->successResponse(new TahunAkademikResource(TahunAkademik::findOrFail($id)), 'Detail tahun akademik berhasil diambil');
    }

    /**
     * Update an academic year.
     *
     * Updates an academic year record. If `AKTIF = Y` is provided, this record becomes the only active academic year.
     */
    public function update(TahunAkademikUpdateRequest $request, int $id): JsonResponse
    {
        $tahun = TahunAkademik::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($tahun, $validated) {
            $shouldActivate = ($validated['AKTIF'] ?? null) === 'Y';
            unset($validated['AKTIF']);
            $tahun->update($validated);

            if ($shouldActivate) {
                $this->toggle->activateExclusive($tahun, 'AKTIF');
            }
        });

        return $this->successResponse(new TahunAkademikResource($tahun->fresh()), 'Tahun akademik berhasil diperbarui');
    }

    /**
     * Delete an academic year.
     *
     * Deletes an academic year record. Active academic years cannot be deleted.
     */
    public function destroy(int $id): JsonResponse
    {
        $tahun = TahunAkademik::findOrFail($id);

        if ($tahun->AKTIF === 'Y') {
           return $this->errorResponse('Tidak dapat menghapus tahun akademik yang sedang aktif.', 422);
        }

        $tahun->delete();
        return $this->successMessage('Tahun akademik berhasil dihapus');
    }
}

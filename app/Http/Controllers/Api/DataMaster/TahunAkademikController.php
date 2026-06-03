<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Http\Controllers\Controller;
use App\Models\TahunAkademik;
use App\Http\Requests\TahunAkademikUpdateRequest;
use App\Http\Resources\TahunAkademikResource;
use App\Services\ActivateToggle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TahunAkademikController extends Controller
{
    public function __construct(protected ActivateToggle $toggle) {}

    public function index(): JsonResponse
    {
        $data = TahunAkademik::orderByDesc('ID_TAHUN_AKADEMIK')->get();
        return $this->successCollection(TahunAkademikResource::collection($data), 'Data tahun akademik berhasil diambil');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'NAMA_TAHUN_AKADEMIK' => 'required|string|max:40|unique:tahun_akademik,NAMA_TAHUN_AKADEMIK',
            'AKTIF'               => 'required|in:Y,T',
            'TGL_AWAL_KULIAH'     => 'required|date_format:Y-m-d',
            'TGL_AKHIR_KULIAH'    => 'required|date_format:Y-m-d|after:TGL_AWAL_KULIAH',
        ]);

        $tahun = DB::transaction(function () use ($validated) {
            // Create as inactive first to avoid a transient "two active rows" state.
            $shouldActivate = $validated['AKTIF'] === 'Y';
            if ($shouldActivate) {
                $validated['AKTIF'] = 'T';
            }

            $tahun = TahunAkademik::create($validated);

            if ($shouldActivate) {
                $this->toggle->activateExclusive($tahun, 'AKTIF');
            }

            return $tahun;
        });

        return $this->successResponse(new TahunAkademikResource($tahun->fresh()), 'Tahun akademik berhasil ditambahkan', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(new TahunAkademikResource(TahunAkademik::findOrFail($id)), 'Detail tahun akademik berhasil diambil');
    }

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
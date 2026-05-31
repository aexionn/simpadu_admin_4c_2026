<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\KelasStoreRequest;
use App\Http\Requests\KelasUpdateRequest;
use App\Http\Resources\KelasResource;
use App\Models\Kelas;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class KelasController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Kelas::with(['programKelas', 'tahunAkademik'])->orderByDesc('ID_KELAS')->get();
        return $this->successCollection(
            KelasResource::collection($kelas),
            'Data kelas berhasil diambil'
        );
    }

    public function store(KelasStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $prodiService = app(ProdiClientService::class);
            if ($prodiService->getProdi((int) $validated['ID_PRODI']) === null) {
                return $this->errorResponse('Prodi tidak ditemukan di sistem eksternal', 502);
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal menghubungi layanan prodi', 503);
        }

        $kelas = DB::transaction(fn () => Kelas::create($validated));

        return $this->successResponse(
            new KelasResource($kelas->load(['programKelas', 'tahunAkademik'])),
            'Kelas berhasil ditambahkan',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $kelas = Kelas::with(['programKelas', 'tahunAkademik', 'mahasiswas', 'kelasMasters'])
            ->findOrFail($id);

        return $this->successResponse(
            new KelasResource($kelas),
            'Detail kelas berhasil diambil'
        );
    }

    public function update(KelasUpdateRequest $request, int $id): JsonResponse
    {
        $kelas = Kelas::findOrFail($id);
        $validated = $request->validated();

        if (isset($validated['ID_PRODI'])) {
            try {
                $prodiService = app(ProdiClientService::class);
                if ($prodiService->getProdi((int) $validated['ID_PRODI']) === null) {
                    return $this->errorResponse('Prodi tidak ditemukan di sistem eksternal', 502);
                }
            } catch (\Exception $e) {
                return $this->errorResponse('Gagal menghubungi layanan prodi', 503);
            }
        }

        DB::transaction(fn () => $kelas->update($validated));

        return $this->successResponse(
            new KelasResource($kelas->fresh()->load(['programKelas', 'tahunAkademik'])),
            'Kelas berhasil diperbarui'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        DB::transaction(fn () => Kelas::findOrFail($id)->delete());
        return $this->successMessage('Kelas berhasil dihapus');
    }

    public function addStudent(int $kelasId, KelasMahasiswaStoreRequest $request): JsonResponse
    {
        $kelas = Kelas::findOrFail($kelasId);
        DB::transaction(fn () => $kelas->mahasiswas()->create($request->validated()));

        return $this->successResponse(
            new KelasMahasiswaResource($mahasiswa),
            'Mahasiswa berhasil ditambahkan ke kelas',
            201
        );
    }

    public function removeStudent(int $kelasId, int $mahasiswaId): JsonResponse
    {
        $kelas = Kelas::findOrFail($kelasId);
        DB::transaction(fn () => $kelas->mahasiswas()->where('ID_BERGABUNG', $mahasiswaId)->delete());

        return $this->successMessage('Mahasiswa berhasil dikeluarkan dari kelas');
    }
}
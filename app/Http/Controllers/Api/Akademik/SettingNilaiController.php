<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\SettingNilaiStoreRequest;
use App\Http\Requests\SettingNilaiUpdateRequest;
use App\Http\Resources\SettingNilaiResource;
use App\Models\SettingNilai;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingNilaiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_dosen' => 'sometimes|integer',
            'id_kelas' => 'sometimes|integer|exists:kelas,ID_KELAS',
            'id_mk' => 'sometimes|integer|exists:mata_kuliah,ID_MK',
        ]);

        $settings = SettingNilai::with(['kelas', 'mataKuliah'])
            ->when(isset($validated['id_dosen']), fn ($query) => $query->where('id_dosen', $validated['id_dosen']))
            ->when(isset($validated['id_kelas']), fn ($query) => $query->where('id_kelas', $validated['id_kelas']))
            ->when(isset($validated['id_mk']), fn ($query) => $query->where('id_mk', $validated['id_mk']))
            ->orderByDesc('id')
            ->get();

        return $this->successCollection(
            SettingNilaiResource::collection($settings),
            'Data setting nilai berhasil diambil'
        );
    }

    public function store(SettingNilaiStoreRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($this->settingExists($data['id_dosen'], $data['id_kelas'], $data['id_mk'])) {
            return $this->errorResponse(
                'Setting nilai untuk dosen, kelas, dan mata kuliah tersebut sudah ada.',
                409
            );
        }

        $setting = DB::transaction(fn () => SettingNilai::create($data));

        return $this->successResponse(
            new SettingNilaiResource($setting->load(['kelas', 'mataKuliah'])),
            'Setting nilai berhasil ditambahkan',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $setting = SettingNilai::with(['kelas', 'mataKuliah'])->findOrFail($id);

        return $this->successResponse(
            new SettingNilaiResource($setting),
            'Detail setting nilai berhasil diambil'
        );
    }

    public function update(SettingNilaiUpdateRequest $request, int $id): JsonResponse
    {
        $setting = SettingNilai::findOrFail($id);
        $data = array_merge($setting->only([
            'id_dosen',
            'id_kelas',
            'id_mk',
            'participation',
            'assignment',
            'quiz',
            'uts',
            'uas',
        ]), $request->validated());

        if (! $this->hasValidTotalWeight($data)) {
            return $this->errorResponse(
                'Total bobot nilai harus sama dengan 100.',
                422,
                ['weights' => ['Total bobot nilai harus sama dengan 100.']]
            );
        }

        $duplicate = SettingNilai::where('id_dosen', $data['id_dosen'])
            ->where('id_kelas', $data['id_kelas'])
            ->where('id_mk', $data['id_mk'])
            ->whereKeyNot($setting->getKey())
            ->exists();

        if ($duplicate) {
            return $this->errorResponse(
                'Setting nilai untuk dosen, kelas, dan mata kuliah tersebut sudah ada.',
                409
            );
        }

        DB::transaction(fn () => $setting->update($data));

        return $this->successResponse(
            new SettingNilaiResource($setting->fresh()->load(['kelas', 'mataKuliah'])),
            'Setting nilai berhasil diperbarui'
        );
    }

    private function settingExists(int $idDosen, int $idKelas, int $idMk): bool
    {
        return SettingNilai::where('id_dosen', $idDosen)
            ->where('id_kelas', $idKelas)
            ->where('id_mk', $idMk)
            ->exists();
    }

    private function hasValidTotalWeight(array $data): bool
    {
        $total = ((float) $data['participation'])
            + ((float) $data['assignment'])
            + ((float) $data['quiz'])
            + ((float) $data['uts'])
            + ((float) $data['uas']);

        return abs($total - 100) <= 0.00001;
    }
}

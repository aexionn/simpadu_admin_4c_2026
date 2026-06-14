<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\NilaiStoreRequest;
use App\Http\Requests\NilaiUpdateRequest;
use App\Models\Nilai;
use App\Http\Resources\NilaiResource;
use App\Models\SettingNilai;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;

class NilaiController extends Controller
{
    private const DEFAULT_WEIGHTS = [
        'participation' => 10,
        'assignment' => 20,
        'quiz' => 10,
        'uts' => 30,
        'uas' => 30,
    ];

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_dosen' => 'sometimes|integer',
            'id_kelas' => 'sometimes|integer|exists:kelas,ID_KELAS',
            'id_mk' => 'sometimes|integer|exists:mata_kuliah,ID_MK',
            'nim' => 'sometimes|string|size:11',
        ]);

        $nilai = Nilai::with(['kelas', 'mataKuliah'])
            ->when(isset($validated['id_dosen']), fn ($query) => $query->where('id_dosen', $validated['id_dosen']))
            ->when(isset($validated['id_kelas']), fn ($query) => $query->where('id_kelas', $validated['id_kelas']))
            ->when(isset($validated['id_mk']), fn ($query) => $query->where('id_mk', $validated['id_mk']))
            ->when(isset($validated['nim']), fn ($query) => $query->where('nim', $validated['nim']))
            ->orderByDesc('id')
            ->get();

        return $this->successCollection(
            NilaiResource::collection($nilai),
            'Data Nilai berhasil diambil'
        );
    }

    public function store(NilaiStoreRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($this->gradeExists($data['id_kelas'], $data['id_mk'], $data['nim'])) {
            return $this->errorResponse(
                'Nilai untuk kelas, mata kuliah, dan NIM tersebut sudah ada.',
                409
            );
        }

        $nilai = DB::transaction(fn () => Nilai::create($this->withCalculatedGrade($data)));

        return $this->successResponse(
            new NilaiResource($nilai->load(['kelas', 'mataKuliah'])),
            'Nilai berhasil ditambahkan',
            201
        );
    }

    public function batchStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_dosen' => 'required|integer',
            'id_kelas' => 'required|integer|exists:kelas,ID_KELAS',
            'id_mk' => 'required|integer|exists:mata_kuliah,ID_MK',
            'grades' => 'required|array|min:1',
            'grades.*.nim' => 'required|string|size:11',
            'grades.*.participation_score' => 'required|numeric|min:0|max:100',
            'grades.*.assignment_score' => 'required|numeric|min:0|max:100',
            'grades.*.quiz_score' => 'required|numeric|min:0|max:100',
            'grades.*.uts_score' => 'required|numeric|min:0|max:100',
            'grades.*.uas_score' => 'required|numeric|min:0|max:100',
        ]);

        $duplicateNims = Nilai::where('id_kelas', $validated['id_kelas'])
            ->where('id_mk', $validated['id_mk'])
            ->whereIn('nim', collect($validated['grades'])->pluck('nim')->unique()->values())
            ->pluck('nim')
            ->values()
            ->all();

        $repeatedNims = collect($validated['grades'])
            ->countBy('nim')
            ->filter(fn (int $count) => $count > 1)
            ->keys()
            ->values()
            ->all();

        $duplicates = array_values(array_unique(array_merge($duplicateNims, $repeatedNims)));

        if ($duplicates !== []) {
            return $this->errorResponse(
                'Terdapat nilai duplikat untuk kelas dan mata kuliah tersebut.',
                409,
                ['duplicates' => array_map(fn (string $nim) => [
                    'id_kelas' => $validated['id_kelas'],
                    'id_mk' => $validated['id_mk'],
                    'nim' => $nim,
                ], $duplicates)]
            );
        }

        $created = DB::transaction(function () use ($validated) {
            $created = collect($validated['grades'])->map(function (array $grade) use ($validated) {
                return Nilai::create($this->withCalculatedGrade([
                    'id_dosen' => $validated['id_dosen'],
                    'id_kelas' => $validated['id_kelas'],
                    'id_mk' => $validated['id_mk'],
                    ...$grade,
                ]));
            });

            return new EloquentCollection($created->all());
        });

        return $this->successCollection(
            NilaiResource::collection($created->load(['kelas', 'mataKuliah'])),
            'Batch nilai berhasil ditambahkan',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $nilai = Nilai::with(['kelas', 'mataKuliah'])->findOrFail($id);

        return $this->successResponse(
            new NilaiResource($nilai),
            'Detail Nilai berhasil diambil'
        );
    }

    public function update(NilaiUpdateRequest $request, int $id): JsonResponse
    {
        $nilai = Nilai::findOrFail($id);
        $data = array_merge($nilai->only([
            'id_dosen',
            'nim',
            'id_kelas',
            'id_mk',
            'participation_score',
            'assignment_score',
            'quiz_score',
            'uts_score',
            'uas_score',
        ]), $request->validated());

        $duplicate = Nilai::where('id_kelas', $data['id_kelas'])
            ->where('id_mk', $data['id_mk'])
            ->where('nim', $data['nim'])
            ->whereKeyNot($nilai->getKey())
            ->exists();

        if ($duplicate) {
            return $this->errorResponse(
                'Nilai untuk kelas, mata kuliah, dan NIM tersebut sudah ada.',
                409
            );
        }

        DB::transaction(fn () => $nilai->update($this->withCalculatedGrade($data)));

        return $this->successResponse(
            new NilaiResource($nilai->fresh()->load(['kelas', 'mataKuliah'])),
            'Nilai berhasil diperbarui'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        DB::transaction(fn () => Nilai::findOrFail($id)->delete());

        return $this->successMessage('Nilai berhasil dihapus');
    }

    private function gradeExists(int $idKelas, int $idMk, string $nim): bool
    {
        return Nilai::where('id_kelas', $idKelas)
            ->where('id_mk', $idMk)
            ->where('nim', $nim)
            ->exists();
    }

    private function withCalculatedGrade(array $data): array
    {
        $finalScore = $this->calculateFinalScore($data);
        $data['final_score'] = $finalScore;
        $data['grade'] = $this->letterGrade($finalScore);

        return $data;
    }

    private function calculateFinalScore(array $data): float
    {
        $weights = $this->weightsFor(
            (int) $data['id_dosen'],
            (int) $data['id_kelas'],
            (int) $data['id_mk']
        );

        return round(
            (((float) $data['participation_score']) * $weights['participation'] / 100)
            + (((float) $data['assignment_score']) * $weights['assignment'] / 100)
            + (((float) $data['quiz_score']) * $weights['quiz'] / 100)
            + (((float) $data['uts_score']) * $weights['uts'] / 100)
            + (((float) $data['uas_score']) * $weights['uas'] / 100),
            2
        );
    }

    private function weightsFor(int $idDosen, int $idKelas, int $idMk): array
    {
        $setting = SettingNilai::where('id_dosen', $idDosen)
            ->where('id_kelas', $idKelas)
            ->where('id_mk', $idMk)
            ->first();

        if (! $setting) {
            return self::DEFAULT_WEIGHTS;
        }

        return [
            'participation' => (float) $setting->participation,
            'assignment' => (float) $setting->assignment,
            'quiz' => (float) $setting->quiz,
            'uts' => (float) $setting->uts,
            'uas' => (float) $setting->uas,
        ];
    }

    private function letterGrade(float $finalScore): string
    {
        return match (true) {
            $finalScore >= 85 => 'A',
            $finalScore >= 80 => 'AB',
            $finalScore >= 75 => 'B',
            $finalScore >= 70 => 'BC',
            $finalScore >= 60 => 'C',
            $finalScore >= 50 => 'D',
            default => 'E',
        };
    }
}

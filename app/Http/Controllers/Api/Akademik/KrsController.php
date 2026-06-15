<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\KrsStatusUpdateRequest;
use App\Http\Requests\KrsStoreRequest;
use App\Http\Requests\KrsUpdateRequest;
use App\Http\Requests\ManageKelasMkRequest;
use App\Models\Krs;
use App\Http\Resources\KrsResource;
use App\Models\KelasMaster;
use App\Models\KelasMk;
use Carbon\CarbonInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class KrsController extends Controller
{
    private const STATUS_PENDING = 'Menunggu Persetujuan';
    private const STATUS_APPROVED = 'Disetujui';
    private const STATUS_REJECTED = 'Ditolak';
    private const APPROVED_LOCK_MESSAGE = 'KRS yang sudah disetujui tidak dapat diubah.';

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'id_kelas_master' => 'sometimes|integer|exists:kelas_master,ID_KELAS_MASTER',
            'nim'             => 'sometimes|string|size:11',
            'semester'        => 'sometimes|integer|min:1|max:14',
            'status'          => 'sometimes|in:Disetujui,Ditolak,Menunggu Persetujuan',
        ]);

        $krs = Krs::with(['kelasMaster', 'kelasMks'])
            ->when(isset($filters['id_kelas_master']), fn ($query) => $query->where('ID_KELAS_MASTER', $filters['id_kelas_master']))
            ->when(isset($filters['nim']), fn ($query) => $query->where('NIM', $filters['nim']))
            ->when(isset($filters['semester']), fn ($query) => $query->where('SEMESTER', $filters['semester']))
            ->when(isset($filters['status']), fn ($query) => $query->where('STATUS', $filters['status']))
            ->orderByDesc('ID_KRS')
            ->get();

        return $this->successCollection(KrsResource::collection($krs), 'Data KRS berhasil diambil');
    }

    public function store(KrsStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $kelasMaster = KelasMaster::findOrFail($validated['id_kelas_master']);

        if ($error = $this->validateKelasMasterForKrs($kelasMaster, $validated['nim'])) {
            return $error;
        }

        if ($this->hasDuplicateKrs($validated['nim'], $validated['semester'])) {
            return $this->errorResponse('KRS untuk NIM dan semester tersebut sudah ada.', 422);
        }

        $kelasMks = KelasMk::whereIn('ID_KELAS_MK', $validated['kelas_mk_ids'])->get();

        if ($error = $this->validateKelasMksForKelasMaster($kelasMks, $kelasMaster)) {
            return $error;
        }

        if ($this->hasScheduleConflict($kelasMks)) {
            return $this->errorResponse('Jadwal kelas MK bertabrakan dengan jadwal yang sudah dipilih.', 422);
        }

        $krs = DB::transaction(function () use ($validated) {
            $krs = Krs::create([
                'ID_KELAS_MASTER' => $validated['id_kelas_master'],
                'NIM'             => $validated['nim'],
                'SEMESTER'        => $validated['semester'],
                'STATUS'          => self::STATUS_PENDING,
            ]);

            $krs->kelasMks()->sync($validated['kelas_mk_ids']);

            return $krs;
        });

        return $this->successResponse(new KrsResource($krs->load(['kelasMaster', 'kelasMks'])), 'KRS berhasil ditambahkan', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(new KrsResource(Krs::with(['kelasMaster', 'kelasMks'])->findOrFail($id)), 'Detail KRS berhasil diambil');
    }

    public function update(KrsUpdateRequest $request, int $id): JsonResponse
    {
        $krs = Krs::findOrFail($id);
        $validated = $request->validated();

        if ($krs->STATUS === self::STATUS_APPROVED) {
            return $this->errorResponse(self::APPROVED_LOCK_MESSAGE, 422);
        }

        $idKelasMaster = $validated['id_kelas_master'] ?? $krs->ID_KELAS_MASTER;
        $nim = $validated['nim'] ?? $krs->NIM;
        $semester = $validated['semester'] ?? $krs->SEMESTER;
        $kelasMaster = KelasMaster::findOrFail($idKelasMaster);

        if ($error = $this->validateKelasMasterForKrs($kelasMaster, $nim)) {
            return $error;
        }

        if ((array_key_exists('nim', $validated) || array_key_exists('semester', $validated))
            && $this->hasDuplicateKrs($nim, $semester, $krs->ID_KRS)) {
            return $this->errorResponse('KRS untuk NIM dan semester tersebut sudah ada.', 422);
        }

        $payload = $this->mapUpdatePayload($validated);

        if ($this->containsEditableKrsData($validated) && $krs->STATUS === self::STATUS_REJECTED) {
            $payload['STATUS'] = self::STATUS_PENDING;
        }

        DB::transaction(fn () => $krs->update($payload));

        return $this->successResponse(new KrsResource($krs->fresh()->load(['kelasMaster', 'kelasMks'])), 'KRS berhasil diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        DB::transaction(function () use ($id) {
            $krs = Krs::findOrFail($id);
            $krs->kelasMks()->detach();
            $krs->delete();
        });

        return $this->successMessage('KRS berhasil dihapus');
    }

    public function updateStatus(KrsStatusUpdateRequest $request, int $id): JsonResponse
    {
        $krs = Krs::findOrFail($id);

        DB::transaction(fn () => $krs->update([
            'STATUS' => $request->validated('status'),
        ]));

        return $this->successResponse(new KrsResource($krs->fresh()->load(['kelasMaster', 'kelasMks'])), 'Status KRS berhasil diperbarui');
    }

    public function addKelasMk(int $krsId, ManageKelasMkRequest $request): JsonResponse
    {
        $krs = Krs::with(['kelasMaster', 'kelasMks'])->findOrFail($krsId);

        if ($krs->STATUS === self::STATUS_APPROVED) {
            return $this->errorResponse(self::APPROVED_LOCK_MESSAGE, 422);
        }

        $kelasMk = KelasMk::findOrFail($request->validated('id_kelas_mk'));

        if ((int) $kelasMk->ID_KELAS !== (int) $krs->kelasMaster->ID_KELAS) {
            return $this->errorResponse('Kelas MK tidak sesuai dengan kelas KRS.', 422);
        }

        if ($this->hasScheduleConflict($krs->kelasMks->push($kelasMk))) {
            return $this->errorResponse('Jadwal kelas MK bertabrakan dengan jadwal yang sudah dipilih.', 422);
        }

        DB::transaction(function () use ($krs, $kelasMk) {
            $krs->kelasMks()->syncWithoutDetaching([$kelasMk->ID_KELAS_MK]);

            if ($krs->STATUS === self::STATUS_REJECTED) {
                $krs->update(['STATUS' => self::STATUS_PENDING]);
            }
        });

        return $this->successResponse(new KrsResource($krs->fresh()->load(['kelasMaster', 'kelasMks'])), 'Kelas MK ditambahkan ke KRS');
    }

    public function removeKelasMk(int $krsId, int $kelasMkId): JsonResponse
    {
        $krs = Krs::findOrFail($krsId);

        if ($krs->STATUS === self::STATUS_APPROVED) {
            return $this->errorResponse(self::APPROVED_LOCK_MESSAGE, 422);
        }

        DB::transaction(function () use ($krs, $kelasMkId) {
            $krs->kelasMks()->detach($kelasMkId);

            if ($krs->STATUS === self::STATUS_REJECTED) {
                $krs->update(['STATUS' => self::STATUS_PENDING]);
            }
        });

        return $this->successResponse(new KrsResource($krs->fresh()->load(['kelasMaster', 'kelasMks'])), 'Kelas MK dihapus dari KRS');
    }

    public function myKrs(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nim' => 'required|string|size:11',
        ]);

        $krs = Krs::with(['kelasMaster', 'kelasMks'])
            ->where('NIM', $validated['nim'])
            ->orderByDesc('ID_KRS')
            ->get();

        return $this->successCollection(KrsResource::collection($krs), 'Data KRS mahasiswa berhasil diambil');
    }

    private function validateKelasMasterForKrs(KelasMaster $kelasMaster, string $nim): ?JsonResponse
    {
        if ($kelasMaster->NIM !== $nim) {
            return $this->errorResponse('NIM kelas master tidak sesuai dengan NIM yang dikirim.', 422);
        }

        if ($kelasMaster->STATUS_MHS !== 'Y') {
            return $this->errorResponse('Mahasiswa pada kelas master tidak aktif.', 422);
        }

        return null;
    }

    private function validateKelasMksForKelasMaster(Collection $kelasMks, KelasMaster $kelasMaster): ?JsonResponse
    {
        foreach ($kelasMks as $kelasMk) {
            if ((int) $kelasMk->ID_KELAS !== (int) $kelasMaster->ID_KELAS) {
                return $this->errorResponse('Kelas MK tidak sesuai dengan kelas KRS.', 422);
            }
        }

        return null;
    }

    private function hasDuplicateKrs(string $nim, int $semester, ?int $exceptId = null): bool
    {
        return Krs::where('NIM', $nim)
            ->where('SEMESTER', $semester)
            ->when($exceptId !== null, fn ($query) => $query->where('ID_KRS', '!=', $exceptId))
            ->exists();
    }

    private function hasScheduleConflict(Collection $kelasMks): bool
    {
        $items = $kelasMks->values();

        for ($i = 0; $i < $items->count(); $i++) {
            for ($j = $i + 1; $j < $items->count(); $j++) {
                if ($this->schedulesConflict($items[$i], $items[$j])) {
                    return true;
                }
            }
        }

        return false;
    }

    private function schedulesConflict(KelasMk $first, KelasMk $second): bool
    {
        if ((int) $first->ID_KELAS_MK === (int) $second->ID_KELAS_MK) {
            return false;
        }

        if ($first->ID_HARI === null || $second->ID_HARI === null || (int) $first->ID_HARI !== (int) $second->ID_HARI) {
            return false;
        }

        $firstStart = $this->timeString($first->WAKTU_MULAI);
        $firstEnd = $this->timeString($first->WAKTU_AKHIR);
        $secondStart = $this->timeString($second->WAKTU_MULAI);
        $secondEnd = $this->timeString($second->WAKTU_AKHIR);

        if (! $firstStart || ! $firstEnd || ! $secondStart || ! $secondEnd) {
            return false;
        }

        return $secondStart < $firstEnd && $secondEnd > $firstStart;
    }

    private function timeString(mixed $time): ?string
    {
        if ($time instanceof CarbonInterface) {
            return $time->format('H:i:s');
        }

        return $time ? substr((string) $time, 0, 8) : null;
    }

    private function mapUpdatePayload(array $validated): array
    {
        $payload = [];

        if (array_key_exists('id_kelas_master', $validated)) {
            $payload['ID_KELAS_MASTER'] = $validated['id_kelas_master'];
        }

        if (array_key_exists('nim', $validated)) {
            $payload['NIM'] = $validated['nim'];
        }

        if (array_key_exists('semester', $validated)) {
            $payload['SEMESTER'] = $validated['semester'];
        }

        if (array_key_exists('status', $validated)) {
            $payload['STATUS'] = $validated['status'];
        }

        return $payload;
    }

    private function containsEditableKrsData(array $validated): bool
    {
        return array_key_exists('id_kelas_master', $validated)
            || array_key_exists('nim', $validated)
            || array_key_exists('semester', $validated);
    }
}

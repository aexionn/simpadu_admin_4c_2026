<?php

namespace App\Http\Controllers\Api\DataMaster;

use App\Enums\StatusAktif;
use App\Http\Controllers\Controller;
use App\Http\Requests\KurikulumStoreRequest;
use App\Http\Requests\KurikulumUpdateRequest;
use App\Http\Resources\KurikulumResource;
use App\Models\Kurikulum;
use App\Services\KurikulumService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class KurikulumController extends Controller
{
    public function __construct(protected KurikulumService $service) {}

    public function index(): JsonResponse
    {
        $data = Kurikulum::with('tahunAkademik')
            ->orderByDesc('ID_KURIKULUM')
            ->get()
            ->map(fn ($k) => array_merge($k->toArray(), ['is_locked' => $k->isLocked()]));

        return $this->successCollection(
            KurikulumResource::collection($data),
            'Data kurikulum berhasil diambil'
        );
    }

    public function store(KurikulumStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $shouldActivate = ($validated['AKTIF_KURIKULUM'] ?? null) === StatusAktif::Aktif->value;

        $kurikulum = DB::transaction(function () use ($validated, $shouldActivate) {
            // Create as inactive first if we'll be activating; service will flip it.
            $payload = $validated;
            if ($shouldActivate) {
                $payload['AKTIF_KURIKULUM'] = StatusAktif::TidakAktif->value;
            }
            $k = Kurikulum::create($payload);

            if ($shouldActivate) {
                $this->service->activate($k);
            }

            return $k;
        });

        return $this->successResponse(
            new KurikulumResource($kurikulum->fresh()->load('tahunAkademik')),
            'Kurikulum berhasil ditambahkan',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $kurikulum = Kurikulum::with('tahunAkademik')->findOrFail($id);

        return $this->successResponse(
            new KurikulumResource($kurikulum),
            'Detail kurikulum berhasil diambil'
        );
    }

    public function update(KurikulumUpdateRequest $request, int $id): JsonResponse
    {
        $kurikulum = Kurikulum::findOrFail($id);

        if ($kurikulum->isLocked()) {
            return response()->json([
                'message' => 'This kurikulum is locked and cannot be edited because a newer kurikulum is already active.',
            ], 403);
        }

        $validated = $request->validated();
        $shouldActivate = ($validated['AKTIF_KURIKULUM'] ?? null) === StatusAktif::Aktif->value;

        DB::transaction(function () use ($kurikulum, $validated, $shouldActivate) {
            // Update non-activation fields first.
            $updateFields = $validated;
            unset($updateFields['AKTIF_KURIKULUM']);
            if ($updateFields) {
                $kurikulum->update($updateFields);
            }

            if ($shouldActivate) {
                $this->service->activate($kurikulum);
            } elseif (isset($validated['AKTIF_KURIKULUM'])) {
                $kurikulum->update(['AKTIF_KURIKULUM' => $validated['AKTIF_KURIKULUM']]);
            }
        });

        return $this->successResponse(
            new KurikulumResource($kurikulum->fresh()->load('tahunAkademik')),
            'Kurikulum berhasil diperbarui'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $kurikulum = Kurikulum::findOrFail($id);

        if ($kurikulum->isLocked()) {
            return $this->errorResponse(
                'Kurikulum ini terkunci dan tidak dapat dihapus.',
                403
            );
        }

        $kurikulum->delete();

        return response()->json(['message' => 'Kurikulum deleted successfully.']);
    }
}
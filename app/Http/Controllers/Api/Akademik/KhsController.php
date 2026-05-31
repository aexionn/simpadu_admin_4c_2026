<?php

namespace App\Http\Controllers\Api\Akademik;

use App\Http\Controllers\Controller;
use App\Http\Requests\KhsStoreRequest;
use App\Http\Requests\KhsUpdateRequest;
use App\Http\Resources\KhsResource;
use App\Models\Khs;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class KhsController extends Controller
{
    public function index(): JsonResponse
    {
        $khs = Khs::with('nilais')->orderByDesc('ID_KHS')->get();
        return $this->successCollection(KhsResource::collection($khs), 'Data KHS berhasil diambil');
    }

    public function store(KhsStoreRequest $request): JsonResponse
    {
        $khs = DB::transaction(fn () => Khs::create($request->validated()));

        return $this->successResponse(new KhsResource($khs->load('nilais')), 'KHS berhasil ditambahkan', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(new KhsResource(Krs::with('nilais')->findOrFail($id)), 'Detail KHS berhasil diambil');
    }
    
    public function update(KhsUpdateRequest $request, int $id): JsonResponse
    {
        $khs = Khs::findOrFail($id);
        DB::transaction(fn () => $khs->update($request->validated()));

        return $this->successResponse(new KhsResource($krs->fresh()->load('nilais')), 'KHS berhasil diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        DB::transaction(fn () => Khs::findOrFail($id)->delete());

        return $this->successMessage('KHS berhasil dihapus');
    }
}

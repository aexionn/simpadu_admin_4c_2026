<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProdiDosenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'kode_prodi_dosen' => $this->KODE_PRODI_DOSEN,
            'id_prodi'         => $this->ID_PRODI,
            'prodi_nama'       => $this->resolveProdiName(),   // safe fallback
            'nip'              => $this->NIP,
            'dosen_nama'       => $this->resolveDosenName(),    // safe fallback
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
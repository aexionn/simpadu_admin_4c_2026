<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NilaiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_nilai'     => $this->ID_NILAI,
            'id_khs'       => $this->ID_KHS,
            'id_mk'        => $this->ID_MK,
            'total_nilai'  => $this->TOTAL_NILAI,
            'nilai_huruf'  => $this->NILAI_HURUF,
            'nim'          => $this->NIM,
            'khs'          => new KhsResource($this->whenLoaded('khs')),
            'mata_kuliah'  => new MataKuliahResource($this->whenLoaded('mataKuliah')),
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KrsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_krs'      => $this->ID_KRS,
            'nama_kelas'  => $this->NAMA_KELAS,
            'nim'         => $this->NIM,
            'semester'    => $this->SEMESTER,
            'mata_kuliahs' => MataKuliahResource::collection($this->whenLoaded('mataKuliahs')),
            'created_at'  => $this->created_at?->toDateTimeString(),
            'updated_at'  => $this->updated_at?->toDateTimeString(),
        ];
    }
}
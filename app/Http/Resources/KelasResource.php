<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KelasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_kelas'           => $this->ID_KELAS,
            'id_prodi'           => $this->ID_PRODI,
            'id_program'         => $this->ID_PROGRAM,
            'semester'           => $this->SEMESTER,
            'alias'              => $this->ALIAS,
            'kelas_nama'         => $this->KELAS_NAMA,
            'program_kelas'      => new ProgramKelasResource($this->whenLoaded('programKelas')),
            // 'kelasMks'           => KelasMkResource::collection($this->whenLoaded('kelasMks')),
            // 'kelasMasters'       => KelasMasterResource::collection($this->whenLoaded('kelasMasters')),
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
        ];
    }
}
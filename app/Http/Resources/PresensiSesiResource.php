<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PresensiSesiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_sesi'        => $this->ID_SESI,
            'id_kelas_mk'    => $this->ID_KELAS_MK,
            'pertemuan_ke'   => $this->PERTEMUAN_KE,
            'expires_at'     => $this->expires_at?->toDateTimeString(),
            'is_active'      => $this->is_active,
            'kelas_mk'       => new KelasMkResource($this->whenLoaded('kelasMk')),
        ];
    }
}

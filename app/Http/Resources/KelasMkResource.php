<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KelasMkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_kelas_mk'      => $this->ID_KELAS_MK,
            'id_kelas'         => $this->ID_KELAS,
            'id_kurikulum_mk'  => $this->ID_KURIKULUM_MK,
            'nip'              => $this->NIP,
            'id_hari'          => $this->ID_HARI,
            'waktu_mulai'      => $this->WAKTU_MULAI,
            'waktu_akhir'      => $this->WAKTU_AKHIR,
            'id_ruang'         => $this->ID_RUANG,
            'tema'             => $this->TEMA,
            'deskripsi'        => $this->DESKRIPSI,
            'kelas'            => new KelasResource($this->whenLoaded('kelas')),
            'kurikulum_mk'     => new KurikulumMkResource($this->whenLoaded('kurikulumMk')),
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}

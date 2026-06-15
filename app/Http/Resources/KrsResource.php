<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KrsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_krs'          => $this->ID_KRS,
            'id_kelas_master' => $this->ID_KELAS_MASTER,
            'nim'             => $this->NIM,
            'semester'        => $this->SEMESTER,
            'status'          => $this->STATUS,

            'kelas_master' => $this->whenLoaded('kelasMaster', fn () => [
                'id_kelas'       => $this->kelasMaster->ID_KELAS,
                'nama_kelas'     => $this->kelasMaster->kelas?->KELAS_NAMA,
                'nim'            => $this->kelasMaster->NIM,
                'tahun_akademik' => $this->kelasMaster->ID_TAHUN_AKADEMIK,
            ]),

            'kelas_mks' => $this->whenLoaded('kelasMks', fn () =>
                $this->kelasMks->map(fn ($kelasMk) => [
                    'id_kelas_mk'     => $kelasMk->ID_KELAS_MK,
                    'id_kelas'        => $kelasMk->ID_KELAS,
                    'id_kurikulum_mk' => $kelasMk->ID_KURIKULUM_MK,
                    'nip'             => $kelasMk->NIP,
                ])
            ),

            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}

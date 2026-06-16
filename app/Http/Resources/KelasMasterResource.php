<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KelasMasterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_kelas_master'   => $this->ID_KELAS_MASTER,
            'no_absen'          => $this->NO_ABSEN,
            'id_kelas'          => $this->ID_KELAS,
            'nim'               => $this->NIM,
            'nama_mahasiswa'    => $this->NAMA_MAHASISWA, 
            'id_tahun_akademik' => $this->ID_TAHUN_AKADEMIK,
            'id_status_mhs'     => $this->ID_STATUS_MHS,
            'kelas'             => new KelasResource($this->whenLoaded('kelas')),
            'tahun_akademik'    => new TahunAkademikResource($this->whenLoaded('tahunAkademik')),
            'created_at'        => $this->created_at?->toDateTimeString(),
            'updated_at'        => $this->updated_at?->toDateTimeString(),
        ];
    }
}

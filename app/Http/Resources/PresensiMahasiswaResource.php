<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PresensiMahasiswaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_presensi'      => $this->ID_PRESENSI,
            'id_kelas_master'  => $this->ID_KELAS_MASTER,
            'id_kelas_mk'      => $this->ID_KELAS_MK,
            'id_sesi'          => $this->ID_SESI,
            'nim'              => $this->NIM,
            'waktu_presensi'   => $this->WAKTU_PRESENSI?->toDateTimeString(),
            'pertemuan_ke'     => $this->PERTEMUAN_KE,
            'barcode_data'     => $this->BARCODE_DATA,
            'status_presensi'  => $this->STATUS_PRESENSI,
            'metode'           => $this->METODE,
            'kelas_master'     => new KelasMasterResource($this->whenLoaded('kelasMaster')),
            'kelas_mk'         => new KelasMkResource($this->whenLoaded('kelasMk')),
            'presensi_sesi'    => new PresensiSesiResource($this->whenLoaded('presensiSesi')),
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}

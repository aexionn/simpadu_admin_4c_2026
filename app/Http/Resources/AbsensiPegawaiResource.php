<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbsensiPegawaiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_presensi'     => $this->ID_PRESENSI,
            'nip'             => $this->NIP,
            'status_presensi' => $this->STATUS_PRESENSI,
            'waktu_masuk'     => $this->WAKTU_MASUK,
            'waktu_keluar'    => $this->WAKTU_KELUAR,
            'tanggal'         => $this->TANGGAL?->toDateString(),
            'keterangan'      => $this->KETERANGAN,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
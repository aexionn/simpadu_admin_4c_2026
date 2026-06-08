<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PresensiPegawaiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_presensi'     => $this->ID_PRESENSI,
            'id_user'         => $this->ID_USER,
            'nama_pegawai'    => $this->whenLoaded('user', fn () => $this->user->name),
            'status_presensi' => $this->STATUS_PRESENSI,
            'waktu_masuk'     => $this->WAKTU_MASUK,
            'waktu_keluar'    => $this->WAKTU_KELUAR,
            'tanggal'         => $this->TANGGAL?->toDateString(),
            'keterangan'      => $this->KETERANGAN,
        ];
    }
}
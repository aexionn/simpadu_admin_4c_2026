<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TahunAkademikResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_tahun_akademik'   => $this->ID_TAHUN_AKADEMIK,
            'nama_tahun_akademik' => $this->NAMA_TAHUN_AKADEMIK,
            'aktif'               => $this->AKTIF,
            'tgl_awal_kuliah'     => $this->TGL_AWAL_KULIAH?->toDateString(),
            'tgl_akhir_kuliah'    => $this->TGL_AKHIR_KULIAH?->toDateString(),
        ];
    }
}
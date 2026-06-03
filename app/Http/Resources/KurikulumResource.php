<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KurikulumResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_kurikulum'        => $this->ID_KURIKULUM,
            'id_tahun_akademik'   => $this->ID_TAHUN_AKADEMIK,
            'nama_kurikulum'      => $this->NAMA_KURIKULUM,
            'catatan_kurikulum'   => $this->CATATAN_KURIKULUM,
            'aktif_kurikulum'     => $this->AKTIF_KURIKULUM,
            'is_locked'           => $this->isLocked(),
            'superseded_at'       => $this->superseded_at?->toDateTimeString(),
            'tahun_akademik'      => new TahunAkademikResource($this->whenLoaded('tahunAkademik')),
            'mata_kuliah'         => MataKuliahResource::collection($this->whenLoaded('mataKuliahs')),
        ];
    }
}
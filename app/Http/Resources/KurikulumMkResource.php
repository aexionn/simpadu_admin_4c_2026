<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KurikulumMkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_kurikulum_mk' => $this->ID_KURIKULUM_MK,
            'id_mk'           => $this->ID_MK,
            'id_kurikulum'    => $this->ID_KURIKULUM,
            'mata_kuliah'     => new MataKuliahResource($this->whenLoaded('mataKuliah')),
            'kurikulum'       => new KurikulumResource($this->whenLoaded('kurikulum')),
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}

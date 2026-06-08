<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KabupatenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'KODE_KABUPATEN' => $this->KODE_KABUPATEN,
            'KODE_PROVINSI'  => $this->KODE_PROVINSI,
            'NAMA_KABUPATEN' => $this->NAMA_KABUPATEN,
            'provinsi'       => new ProvinsiResource($this->whenLoaded('provinsi')),
            'created_at'     => $this->created_at?->toDateTimeString(),
            'updated_at'     => $this->updated_at?->toDateTimeString(),
        ];
    }
}

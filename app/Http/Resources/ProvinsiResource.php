<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProvinsiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'KODE_PROVINSI' => $this->KODE_PROVINSI,
            'NAMA_PROVINSI' => $this->NAMA_PROVINSI,
            'kabupaten'     => KabupatenResource::collection($this->whenLoaded('kabupaten')),
            'created_at'    => $this->created_at?->toDateTimeString(),
            'updated_at'    => $this->updated_at?->toDateTimeString(),
        ];
    }
}

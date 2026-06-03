<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProdiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_prodi'    => $this->id_prodi,
            'nama_prodi'  => $this->nama_prodi,
            'jenjang'     => $this->jenjang,
            'id_jurusan'  => $this->id_jurusan,
            'visi'        => $this->visi,
            'jurusan'     => new JurusanResource($this->whenLoaded('jurusan')),
            'created_at'  => $this->created_at?->toDateTimeString(),
            'updated_at'  => $this->updated_at?->toDateTimeString(),
        ];
    }
}

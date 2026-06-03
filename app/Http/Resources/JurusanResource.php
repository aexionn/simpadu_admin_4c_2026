<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JurusanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_jurusan'   => $this->id_jurusan,
            'nama_jurusan' => $this->nama_jurusan,
            'visi'         => $this->visi,
            'misi'         => $this->misi,
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
        ];
    }
}

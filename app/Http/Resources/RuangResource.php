<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RuangResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_ruang'   => $this->id_ruang,
            'nama_ruang' => $this->nama_ruang,
        ];
    }
}

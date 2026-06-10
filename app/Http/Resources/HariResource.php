<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HariResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_hari'   => $this->id_hari,
            'nama_hari' => $this->nama_hari,
        ];
    }
}

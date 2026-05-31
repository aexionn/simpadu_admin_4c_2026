<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MataKuliahResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_mk'     => $this->ID_MK, 
            'nama_mk'   => $this->NAMA_MK,
            'semester'  => $this->SEMESTER,
            'sks'       => $this->SKS,
            'jam'       => $this->JAM,
        ];
    }
}
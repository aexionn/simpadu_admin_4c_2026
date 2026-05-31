<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgramKelasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_program'   => $this->ID_PROGRAM,
            'nama_program' => $this->NAMA_PROGRAM,
            'aktif'        => $this->AKTIF,
        ];
    }
}
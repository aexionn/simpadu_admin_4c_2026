<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingNilaiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'id_dosen'      => $this->id_dosen,
            'id_kelas'      => $this->id_kelas,
            'id_mk'         => $this->id_mk,
            'participation' => $this->participation,
            'assignment'    => $this->assignment,
            'quiz'          => $this->quiz,
            'uts'           => $this->uts,
            'uas'           => $this->uas,
            'kelas'         => new KelasResource($this->whenLoaded('kelas')),
            'mata_kuliah'   => new MataKuliahResource($this->whenLoaded('mataKuliah')),
            'created_at'    => $this->created_at?->toDateTimeString(),
            'updated_at'    => $this->updated_at?->toDateTimeString(),
        ];
    }
}

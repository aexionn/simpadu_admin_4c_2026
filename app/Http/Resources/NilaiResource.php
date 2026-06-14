<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NilaiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'id_dosen'            => $this->id_dosen,
            'nim'                 => $this->nim,
            'id_kelas'            => $this->id_kelas,
            'id_mk'               => $this->id_mk,
            'participation_score' => $this->participation_score,
            'assignment_score'    => $this->assignment_score,
            'quiz_score'          => $this->quiz_score,
            'uts_score'           => $this->uts_score,
            'uas_score'           => $this->uas_score,
            'final_score'         => $this->final_score,
            'grade'               => $this->grade,
            'kelas'               => new KelasResource($this->whenLoaded('kelas')),
            'mata_kuliah'         => new MataKuliahResource($this->whenLoaded('mataKuliah')),
            'created_at'          => $this->created_at?->toDateTimeString(),
            'updated_at'          => $this->updated_at?->toDateTimeString(),
        ];
    }
}

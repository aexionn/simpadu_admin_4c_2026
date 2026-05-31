<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KhsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_khs'   => $this->ID_KHS,
            'semester' => $this->SEMESTER,
            'nim'      => $this->NIM,
            'ips'      => $this->IPS,
            'ipk'      => $this->IPK,
            'nilais'   => NilaiResource::collection($this->whenLoaded('nilais')),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
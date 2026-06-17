<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_user'   => $this->id_user,
            'name'      => $this->name,
            'email'     => $this->email,
            'is_active' => $this->is_active,
            'roles'     => $this->whenLoaded('roles', fn() => $this->roles->pluck('role_name')->unique()->values()),
        ];
    }
}
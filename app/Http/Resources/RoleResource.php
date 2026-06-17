<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_role'     => $this->id_role,
            'role_name'   => $this->role_name,
            'users_count' => $this->whenCounted('users'),
        ];
    }
}
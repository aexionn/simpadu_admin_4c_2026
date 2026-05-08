<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Hidden;

class Role extends Model
{
    protected $primaryKey = "id_role";

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles', 'id_role', 'id_user')->withTimestamps();
    }
}

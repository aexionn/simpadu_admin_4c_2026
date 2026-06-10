<?php

namespace App\Models;

use App\Enums\StatusAktif;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $primaryKey = 'id_user';
    public $incrementing = true;
    protected $fillable = ['name', 'email', 'password', 'is_active'];

    protected $hidden = ['password', 'email_verified_at', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => StatusAktif::class,
            'deleted_at'        => 'datetime',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'id_user', 'id_role')
            ->withTimestamps();
    }

    public function refreshTokens()
    {
        return $this->hasMany(RefreshToken::class, 'id_user', 'id_user');
    }

    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('role_name', $roleName)->exists();
    }
}

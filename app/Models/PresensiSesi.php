<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PresensiSesi extends Model
{
    protected $table = 'presensi_sesi';
    protected $primaryKey = 'ID_SESI';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'ID_KELAS_MK',
        'PERTEMUAN_KE',
        'session_token',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active'  => 'boolean',
    ];

    public function kelasMk()
    {
        return $this->belongsTo(KelasMk::class, 'ID_KELAS_MK', 'ID_KELAS_MK');
    }

    public function presensiMahasiswas()
    {
        return $this->hasMany(PresensiMahasiswa::class, 'ID_SESI', 'ID_SESI');
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}

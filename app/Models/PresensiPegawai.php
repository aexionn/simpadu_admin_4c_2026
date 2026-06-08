<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PresensiPegawai extends Model
{
    protected $table = 'presensi_pegawai';
    protected $primaryKey = 'ID_PRESENSI';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'STATUS_PRESENSI',
        'WAKTU_MASUK',
        'WAKTU_KELUAR',
        'TANGGAL',
        'KETERANGAN',
    ];

    protected $casts = [
        'WAKTU_MASUK'  => 'datetime:H:i:s',
        'WAKTU_KELUAR' => 'datetime:H:i:s',
        'TANGGAL'      => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PresensiPegawai extends Model
{
    protected $table = 'presensi_pegawai';
    protected $primaryKey = 'ID_PRESENSI';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'NIP',
        'STATUS_PRESENSI',
        'WAKTU_MASUK',
        'WAKTU_KELUAR',
        'TANGGAL',
        'KETERANGAN',
    ];

    protected $casts = [
        'WAKTU_MASUK' => 'datetime:H:i:s',
        'WAKTU_KELUAR' => 'datetime:H:i:s',
        'TANGGAL' => 'date',
    ];
}
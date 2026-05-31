<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbsensiPegawai extends Model
{
    protected $table = 'absensi_pegawai';
    protected $primaryKey = 'ID_PRESENSI';
    public $incrementing = true;

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
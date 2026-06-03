<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PresensiMahasiswa extends Model
{
    protected $table = 'presensi_mahasiswa';
    protected $primaryKey = 'ID_PRESENSI';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'ID_KELAS_MASTER',
        'ID_KELAS_MK',
        'ID_SESI',
        'NIM',
        'WAKTU_PRESENSI',
        'PERTEMUAN_KE',
        'BARCODE_DATA',
        'STATUS_PRESENSI',
        'METODE',
    ];

    protected $casts = [
        'WAKTU_PRESENSI' => 'datetime',
    ];

    public function kelasMaster()
    {
        return $this->belongsTo(KelasMaster::class, 'ID_KELAS_MASTER', 'ID_KELAS_MASTER');
    }

    public function kelasMk()
    {
        return $this->belongsTo(KelasMk::class, 'ID_KELAS_MK', 'ID_KELAS_MK');
    }

    public function presensiSesi()
    {
        return $this->belongsTo(PresensiSesi::class, 'ID_SESI', 'ID_SESI');
    }
}

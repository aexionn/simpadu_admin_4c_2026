<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KelasMaster extends Model
{
    protected $table = 'kelas_master';
    protected $primaryKey = 'ID_KELAS_MASTER';
    public $incrementing = true;

    protected $fillable = [
        'NO_ABSEN',
        'ID_KELAS',
        'NIM',
        'ID_TAHUN_AKADEMIK',
        'ID_STATUS_MHS',
    ];

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'ID_KELAS', 'ID_KELAS');
    }

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'ID_TAHUN_AKADEMIK', 'ID_TAHUN_AKADEMIK');
    }

    public function presensiMahasiswas()
    {
        return $this->hasMany(PresensiMahasiswa::class, 'ID_KELAS_MASTER', 'ID_KELAS_MASTER');
    }
}

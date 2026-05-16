<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TahunAkademik extends Model
{
    protected $table      = 'tahun_akademik';
    protected $primaryKey = 'ID_TAHUN_AKADEMIK';
    public    $timestamps = false;           // intentionally no timestamps

    protected $fillable = [
        'NAMA_TAHUN_AKADEMIK',
        'AKTIF',
        'TGL_AWAL_KULIAH',
        'TGL_AKHIR_KULIAH',
    ];

    protected $casts = [
        'TGL_AWAL_KULIAH'  => 'date',
        'TGL_AKHIR_KULIAH' => 'date',
    ];

    public function kurikulums()
    {
        return $this->hasMany(Kurikulum::class, 'ID_TAHUN_AKADEMIK', 'ID_TAHUN_AKADEMIK');
    }
}
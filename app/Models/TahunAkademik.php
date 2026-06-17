<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['ID_TAHUN_AKADEMIK', 'NAMA_TAHUN_AKADEMIK', 'AKTIF', 'TGL_AWAL_KULIAH', 'TGL_AKHIR_KULIAH',])]

class TahunAkademik extends Model
{
    protected $table      = 'tahun_akademik';
    public  $incrementing = false;
    protected $primaryKey = 'ID_TAHUN_AKADEMIK';
    public    $timestamps = false;           // intentionally no timestamps

    protected $casts = [
        'TGL_AWAL_KULIAH'  => 'date',
        'TGL_AKHIR_KULIAH' => 'date',
    ];

    public function kurikulums()
    {
        return $this->hasMany(Kurikulum::class, 'ID_TAHUN_AKADEMIK', 'ID_TAHUN_AKADEMIK');
    }
}
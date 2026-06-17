<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KelasMk extends Model
{
    protected $table = 'kelas_mk';
    protected $primaryKey = 'ID_KELAS_MK';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'ID_KELAS',
        'ID_KURIKULUM_MK',
        'NIP',
        'ID_HARI',
        'WAKTU_MULAI',
        'WAKTU_AKHIR',
        'ID_RUANG',
        'TEMA',
        'DESKRIPSI',
    ];

    protected $casts = [
        'WAKTU_MULAI' => 'datetime:H:i:s',
        'WAKTU_AKHIR' => 'datetime:H:i:s',
    ];

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'ID_KELAS', 'ID_KELAS');
    }

    public function kurikulumMk()
    {
        return $this->belongsTo(KurikulumMk::class, 'ID_KURIKULUM_MK', 'ID_KURIKULUM_MK');
    }

    public function hari()
    {
        return $this->belongsTo(Hari::class, 'ID_HARI', 'id_hari');
    }

    public function ruang()
    {
        return $this->belongsTo(Ruang::class, 'ID_RUANG', 'id_ruang');
    }
}

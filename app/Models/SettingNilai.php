<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SettingNilai extends Model
{
    protected $table = 'setting_nilai';
    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'id_dosen',
        'id_kelas',
        'id_mk',
        'participation',
        'assignment',
        'quiz',
        'uts',
        'uas',
    ];

    protected $casts = [
        'participation' => 'decimal:2',
        'assignment' => 'decimal:2',
        'quiz' => 'decimal:2',
        'uts' => 'decimal:2',
        'uas' => 'decimal:2',
    ];

    public function mataKuliah()
    {
        return $this->belongsTo(MataKuliah::class, 'id_mk', 'ID_MK');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas', 'ID_KELAS');
    }
}

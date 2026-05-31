<?php

namespace App\Models;

use App\Enums\StatusAktif;
use Illuminate\Database\Eloquent\Model;

class Kurikulum extends Model
{
    protected $table      = 'kurikulum';
    public $incrementing = true;
    protected $primaryKey = 'ID_KURIKULUM';

    protected $fillable = [
        'ID_TAHUN_AKADEMIK',
        'NAMA_KURIKULUM',
        'CATATAN_KURIKULUM',
        'AKTIF_KURIKULUM',
        'superseded_at',
    ];

    protected $casts = [
        'AKTIF_KURIKULUM' => StatusAktif::class,
        'superseded_at'   => 'datetime',
    ];

    public function mataKuliahs()
    {
         return $this->belongsToMany(Kurikulum::class, 'kurikulum_mk', 'ID_MK', 'ID_KURIKULUM')
            ->withTimestamps();
    }

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'ID_TAHUN_AKADEMIK', 'ID_TAHUN_AKADEMIK');
    }

    public function isLocked(): bool
    {
        return $this->superseded_at !== null;
    }
}
<?php

namespace App\Models;

use App\Enums\StatusAktif;
use Illuminate\Database\Eloquent\Model;

class Kurikulum extends Model
{
    protected $table      = 'kurikulum';
    protected $primaryKey = 'ID_KURIKULUM';

    protected $fillable = [
        'ID_TAHUN_AKADEMIK',
        'NAMA_KURIKULUM',
        'CATATAN_KURIKULUM',
        'AKTIF_KURIKULUM',
    ];

    protected $casts = [
        'AKTIF_KURIKULUM' => StatusAktif::class,
    ];

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'ID_TAHUN_AKADEMIK', 'ID_TAHUN_AKADEMIK');
    }

    /**
     * A kurikulum is locked if it is inactive (AKTIF_KURIKULUM = 0).
     * Once deactivated by a newer kurikulum, it becomes permanently read-only.
     */
    public function isLocked(): bool
    {
        return $this->AKTIF_KURIKULUM === StatusAktif::TidakAktif;
    }
}
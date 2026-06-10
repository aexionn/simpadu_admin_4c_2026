<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KurikulumMk extends Model
{
    protected $table = 'kurikulum_mk';
    protected $primaryKey = 'ID_KURIKULUM_MK';
    public $incrementing = true;

    protected $fillable = [
        'ID_MK',
        'ID_KURIKULUM',
    ];

    public function mataKuliah()
    {
        return $this->belongsTo(MataKuliah::class, 'ID_MK', 'ID_MK');
    }

    public function kurikulum()
    {
        return $this->belongsTo(Kurikulum::class, 'ID_KURIKULUM', 'ID_KURIKULUM');
    }

    public function kelasMks()
    {
        return $this->hasMany(KelasMk::class, 'ID_KURIKULUM_MK', 'ID_KURIKULUM_MK');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nilai extends Model
{
    protected $table = 'nilai';
    protected $primaryKey = 'ID_NILAI';
    public $incrementing = true;

    protected $fillable = [
        'ID_KHS',
        'ID_MK',
        'TOTAL_NILAI',
        'NILAI_HURUF',
        'NIM',
    ];

    public function khs()
    {
        return $this->belongsTo(Khs::class, 'ID_KHS', 'ID_KHS');
    }

    public function mataKuliah()
    {
        return $this->belongsTo(MataKuliah::class, 'ID_MK', 'ID_MK');
    }
}
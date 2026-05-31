<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Krs extends Model
{
    protected $table = 'krs';
    protected $primaryKey = 'ID_KRS';
    public $incrementing = true;

    protected $fillable = [
        'NAMA_KELAS',
        'NIM',
        'SEMESTER',
    ];

    public function mataKuliahs()
    {
        return $this->belongsToMany(MataKuliah::class, 'mk_krs', 'ID_KRS', 'ID_MK')
            ->withTimestamps();
    }
}
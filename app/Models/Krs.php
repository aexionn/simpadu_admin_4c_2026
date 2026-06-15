<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Krs extends Model
{
    protected $table = 'krs';
    protected $primaryKey = 'ID_KRS';
    public $incrementing = true;

    protected $fillable = [
        'ID_KELAS_MASTER',
        'NIM',
        'SEMESTER',
        'STATUS',
    ];

    public function kelasMaster()
    {
        return $this->belongsTo(KelasMaster::class, 'ID_KELAS_MASTER', 'ID_KELAS_MASTER');
    }

    public function kelasMks()
    {
        return $this->belongsToMany(KelasMk::class, 'kelas_mk_krs', 'ID_KRS', 'ID_KELAS_MK')
            ->withTimestamps();
    }
}

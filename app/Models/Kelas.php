<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    protected $table = 'kelas';
    protected $primaryKey = 'ID_KELAS';
    public $incrementing = true;

    protected $fillable = [
        'ID_PRODI',
        'ID_PROGRAM',
        'ID_TAHUN_AKADEMIK',
        'SEMESTER',
        'ALIAS',
        'KELAS_NAMA',
    ];

    public function programKelas()
    {
        return $this->belongsTo(ProgramKelas::class, 'ID_PROGRAM', 'ID_PROGRAM');
    }

    public function kelasMasters()
    {
        return $this->hasMany(KelasMaster::class, 'ID_KELAS', 'ID_KELAS');
    }

    public function kelasMks()
    {
        return $this->hasMany(KelasMk::class, 'ID_KELAS', 'ID_KELAS');
    }
}
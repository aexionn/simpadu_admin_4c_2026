<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramKelas extends Model
{
    protected $table      = 'program_kelas';
    public $incrementing = true;
    protected $primaryKey = 'ID_PROGRAM';

    protected $fillable = [
        'NAMA_PROGRAM',
        'AKTIF',
    ];
}
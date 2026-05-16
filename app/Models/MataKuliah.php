<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MataKuliah extends Model
{
    protected $table      = 'mata_kuliah';
    protected $primaryKey = 'KODE_MK';

    protected $fillable = [
        'NAMA_MK',
        'SEMESTER',
        'SKS',
        'JAM',
    ];
}
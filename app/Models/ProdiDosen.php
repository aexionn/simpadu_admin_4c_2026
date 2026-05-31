<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProdiDosen extends Model
{
    protected $table = 'prodi_dosen';
    protected $keyType = 'integer';

    protected $fillable = [
        'ID_PRODI',
        'NIP',
    ];
}
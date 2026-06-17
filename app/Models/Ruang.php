<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ruang extends Model
{
    protected $table      = 'ruang';
    public $incrementing = true;
    protected $primaryKey = 'id_ruang';
    public $timestamps    = false;

    protected $fillable = [
        'NAMA_RUANG',
    ];

    public function kelasMks()
    {
        return $this->hasMany(KelasMk::class, 'ID_RUANG', 'id_ruang');
    }
}

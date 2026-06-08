<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provinsi extends Model
{
    protected $table      = 'provinsi';
    protected $primaryKey = 'KODE_PROVINSI';
    public $incrementing  = false;
    protected $keyType    = 'int';

    protected $fillable = [
        'KODE_PROVINSI',
        'NAMA_PROVINSI',
    ];

    public function kabupaten(): HasMany
    {
        return $this->hasMany(Kabupaten::class, 'KODE_PROVINSI', 'KODE_PROVINSI');
    }
}

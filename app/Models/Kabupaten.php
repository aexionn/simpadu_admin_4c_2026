<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kabupaten extends Model
{
    protected $table      = 'kabupaten';
    protected $primaryKey = 'KODE_KABUPATEN';
    public $incrementing  = false;
    protected $keyType    = 'int';

    protected $fillable = [
        'KODE_KABUPATEN',
        'KODE_PROVINSI',
        'NAMA_KABUPATEN',
    ];

    public function provinsi(): BelongsTo
    {
        return $this->belongsTo(Provinsi::class, 'KODE_PROVINSI', 'KODE_PROVINSI');
    }
}

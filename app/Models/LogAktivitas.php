<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogAktivitas extends Model
{
    protected $table = 'log';
    protected $primaryKey = 'ID_LOG';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'TIPE_AKTIVITAS',
        'PESAN',
        'ENTITAS_TERKAIT',
    ];
}

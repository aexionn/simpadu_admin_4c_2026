<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prodi extends Model
{
    protected $table      = 'prodi';
    public $incrementing = true;
    protected $primaryKey = 'id_prodi';

    protected $fillable = [
        'nama_prodi',
        'jenjang',
        'id_jurusan',
        'visi',
    ];

    public function jurusan(): BelongsTo
    {
        return $this->belongsTo(Jurusan::class, 'id_jurusan', 'id_jurusan');
    }
}

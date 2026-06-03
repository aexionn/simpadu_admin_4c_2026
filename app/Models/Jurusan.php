<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jurusan extends Model
{
    protected $table      = 'jurusan';
    public $incrementing = true;
    protected $primaryKey = 'id_jurusan';

    protected $fillable = [
        'nama_jurusan',
        'visi',
        'misi',
    ];

    public function prodi(): HasMany
    {
        return $this->hasMany(Prodi::class, 'id_jurusan', 'id_jurusan');
    }
}

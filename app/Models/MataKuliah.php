<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MataKuliah extends Model
{
    protected $table      = 'mata_kuliah';
    public $incrementing = true;
    protected $primaryKey = 'ID_MK';

    protected $fillable = [
        'NAMA_MK',
        'SEMESTER',
        'SKS',
        'JAM',
    ];

    public function kurikulums()
    {
         return $this->belongsToMany(Kurikulum::class, 'kurikulum_mk', 'ID_MK', 'ID_KURIKULUM')
            ->withTimestamps();
    }

}

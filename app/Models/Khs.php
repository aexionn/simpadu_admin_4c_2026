<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Khs extends Model
{
    protected $table = 'khs';
    protected $primaryKey = 'ID_KHS';
    public $incrementing = true;

    protected $fillable = [
        'SEMESTER',
        'NIM',
        'IPS',
        'IPK',
    ];

    public function nilais()
    {
        return $this->hasMany(Nilai::class, 'ID_KHS', 'ID_KHS');
    }
}
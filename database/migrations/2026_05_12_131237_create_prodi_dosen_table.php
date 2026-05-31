<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prodi_dosen', function (Blueprint $table) {
            $table->integer('ID_PRODI')->unsigned();
            $table->char('NIP', 20)->nullable();
            $table->timestamps();
            $table->index('NIP');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prodi_dosen');
    }
};

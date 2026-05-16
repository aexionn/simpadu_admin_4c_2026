<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prodi_dosen', function (Blueprint $table) {
            $table->integer('KODE_PRODI_DOSEN');
            $table->integer('ID_PRODI')->nullable();
            $table->char('NIP', 20)->nullable();
            $table->timestamps();
            
            $table->index('NIP');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prodi_dosen');
    }
};

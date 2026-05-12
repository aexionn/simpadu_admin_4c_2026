<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tahun_akademik', function (Blueprint $table) {
            $table->integer('ID_TAHUN_AKADEMIK')->primary();
            $table->string('NAMA_TAHUN_AKADEMIK', 40)->nullable();
            $table->enum('AKTIF', ['Y', 'T'])->default('Y');
            $table->date('TGL_AWAL_KULIAH')->nullable();
            $table->date('TGL_AKHIR_KULIAH')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tahun_akademik');
    }
};

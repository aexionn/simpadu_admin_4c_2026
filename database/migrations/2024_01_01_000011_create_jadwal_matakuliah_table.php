<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_matakuliah', function (Blueprint $table) {
            $table->integer('ID_JADWAL')->primary();
            $table->integer('ID_MK');
            $table->string('NAMA_HARI', 10)->nullable();
            $table->time('WAKTU_MULAI')->nullable();
            $table->time('WAKTU_AKHIR')->nullable();
            $table->string('RUANG', 16)->nullable();
            $table->timestamps();

            // FK_JADWAL_MK: jadwal belongs to mata_kuliah
            $table->foreign('ID_MK')
                  ->references('ID_MK')
                  ->on('mata_kuliah')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_matakuliah');
    }
};

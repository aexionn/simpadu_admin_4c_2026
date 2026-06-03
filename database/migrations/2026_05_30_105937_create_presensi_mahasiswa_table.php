<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi_mahasiswa', function (Blueprint $table) {
            $table->increments('ID_PRESENSI')->primary();
            $table->integer('ID_KELAS_MASTER')->unsigned();
            $table->integer('ID_KELAS_MK')->unsigned()->nullable();
            $table->char('NIM', 11)->nullable();
            $table->timestamp('WAKTU_PRESENSI')->useCurrent()->useCurrentOnUpdate();
            $table->integer('PERTEMUAN_KE')->nullable();
            $table->integer('ID_SESI')->unsigned()->nullable();
            $table->enum('STATUS_PRESENSI', ['H', 'I', 'S', 'A']);
            $table->string('METODE', 50);

            $table->foreign('ID_KELAS_MK')
                  ->references('ID_KELAS_MK')
                  ->on('kelas_mk')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
                  
            $table->foreign('ID_SESI')
                  ->references('ID_SESI')
                  ->on('presensi_sesi')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();

            $table->foreign('ID_KELAS_MASTER')
                  ->references('ID_KELAS_MASTER')
                  ->on('kelas_master')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absensi_mahasiswa');
    }
};

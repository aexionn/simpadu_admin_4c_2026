<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi_pegawai', function (Blueprint $table) {
            $table->increments('ID_PRESENSI')->primary();
            $table->char('NIP', 20)->nullable();   
            $table->enum('STATUS_PRESENSI', ['H', 'I', 'S', 'A']);
            $table->time('WAKTU_MASUK');
            $table->time('WAKTU_KELUAR');
            $table->date('TANGGAL');
            $table->text('KETERANGAN')->nullable();
            $table->timestamps();
            $table->index('NIP');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absensi_pegawai');
    }
};

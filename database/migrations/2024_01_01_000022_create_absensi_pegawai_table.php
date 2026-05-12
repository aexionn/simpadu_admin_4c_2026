<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absensi_pegawai', function (Blueprint $table) {
            $table->bigInteger('ID_PRESENSI')->primary();
            $table->char('NIP', 20)->nullable();   
            $table->enum('STATUS_PRESENSI', ['H', 'I', 'S', 'A'])->nullable();
            $table->time('WAKTU_MASUK')->nullable();
            $table->time('WAKTU_KELUAR')->nullable();
            $table->date('TANGGAL')->nullable();
            $table->text('KETERANGAN')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absensi_pegawai');
    }
};

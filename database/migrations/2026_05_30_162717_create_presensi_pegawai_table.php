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
            $table->integer('ID_USER')->unsigned()->nullable();   
            $table->enum('STATUS_PRESENSI', ['H', 'I', 'S', 'A']);
            $table->time('WAKTU_MASUK');
            $table->time('WAKTU_KELUAR')->nullable();
            $table->timestamp('TANGGAL');
            $table->text('KETERANGAN')->nullable();
            $table->index('NIP');

            $table->foreign('ID_USER')
                ->references('id_user')
                ->on('users')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absensi_pegawai');
    }
};
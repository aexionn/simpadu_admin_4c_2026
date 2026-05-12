<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absensi_mahasiswa', function (Blueprint $table) {
            $table->bigInteger('ID_ABSENSI')->primary();
            $table->integer('ID_PERTEMUAN');
            $table->char('NIM', 11)->nullable();
            $table->timestamp('WAKTU_PRESENSI')->useCurrent()->useCurrentOnUpdate();
            $table->enum('STATUS_PRESENSI', ['H', 'I', 'S', 'A'])->nullable();
            $table->string('METODE', 50)->nullable();
            $table->timestamps();

            // FK_MENGABSEN: absensi_mahasiswa belongs to pertemuan
            $table->foreign('ID_PERTEMUAN')
                  ->references('ID_PERTEMUAN')
                  ->on('pertemuan')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absensi_mahasiswa');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kelas_mahasiswa', function (Blueprint $table) {
            $table->integer('ID_BERGABUNG')->primary();
            $table->integer('ID_KELAS');
            $table->char('NIM', 11)->nullable();
            $table->timestamps();

            // FK_BERKELAS: kelas_mahasiswa belongs to kelas
            $table->foreign('ID_KELAS')
                  ->references('ID_KELAS')
                  ->on('kelas')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas_mahasiswa');
    }
};

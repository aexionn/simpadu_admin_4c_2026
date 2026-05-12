<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kelas', function (Blueprint $table) {
            $table->integer('ID_KELAS')->primary();
            $table->integer('ID_PRODI');
            $table->integer('ID_PROGRAM');
            $table->integer('ID_TAHUN_AKADEMIK');
            $table->smallInteger('SEMESTER')->nullable();
            $table->char('ALIAS', 1)->nullable();
            $table->string('KELAS_NAMA', 60)->nullable();
            $table->timestamps();

            // FK_BERPRODI: kelas belongs to prodi
            $table->foreign('ID_PRODI')
                  ->references('ID_PRODI')
                  ->on('prodi')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();

            // FK_BERPROGRAM: kelas belongs to program_kelas
            $table->foreign('ID_PROGRAM')
                  ->references('ID_PROGRAM')
                  ->on('program_kelas')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();

            // FK_BERTAHUN2: kelas belongs to tahun_akademik
            $table->foreign('ID_TAHUN_AKADEMIK')
                  ->references('ID_TAHUN_AKADEMIK')
                  ->on('tahun_akademik')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};

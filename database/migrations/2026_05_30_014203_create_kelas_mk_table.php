<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kelas_mk', function (Blueprint $table) {
            $table->increments('ID_KELAS_MK')->primary();
            $table->integer('ID_KELAS')->unsigned();
            $table->integer('ID_KURIKULUM_MK')->unsigned();
            $table->char('NIP', 20)->nullable();
            $table->integer('ID_HARI')->nullable();
            $table->time('WAKTU_MULAI');
            $table->time('WAKTU_AKHIR');
            $table->integer('ID_RUANG')->unsigned();
            $table->string('TEMA', 20);
            $table->longText('DESKRIPSI')->nullable();
            $table->timestamps();

            $table->foreign('ID_KELAS')
                  ->references('ID_KELAS')
                  ->on('kelas')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();

            $table->foreign('ID_KURIKULUM_MK')
                  ->references('ID_KURIKULUM_MK')
                  ->on('kurikulum_mk')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
            
            $table->index('NIP'); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas_mk');
    }
};

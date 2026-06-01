<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kelas_master', function (Blueprint $table) {
            $table->increments('ID_KELAS_MASTER')->primary();
            $table->tinyInteger('NO_ABSEN');
            $table->integer('ID_KELAS')->unsigned();
            $table->char('NIM', 11)->nullable();
            $table->integer('ID_TAHUN_AKADEMIK')->unsigned();
            $table->enum('STATUS_MHS', ['Y', 'T'])->default('Y');
            $table->timestamps();
            
            $table->foreign('ID_TAHUN_AKADEMIK')
                  ->references('ID_TAHUN_AKADEMIK')
                  ->on('tahun_akademik')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
                  
            $table->foreign('ID_KELAS')
                  ->references('ID_KELAS')
                  ->on('kelas')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kelas_master');
    }
};

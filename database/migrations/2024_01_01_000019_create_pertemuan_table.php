<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pertemuan', function (Blueprint $table) {
            $table->integer('ID_PERTEMUAN')->primary();
            $table->integer('ID_KELAS');
            $table->integer('ID_MK');
            $table->char('NIP', 20)->nullable();   // lecturer NIP — no FK defined in source schema
            $table->smallInteger('PERTEMUAN_KE')->nullable();
            $table->string('TEMA', 20)->nullable();
            $table->longText('DESKRIPSI')->nullable();
            $table->timestamps();

            // FK_MENGAJAR_DI: pertemuan belongs to kelas
            $table->foreign('ID_KELAS')
                  ->references('ID_KELAS')
                  ->on('kelas')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();

            // FK_MENGAJAR_DI2: pertemuan belongs to mata_kuliah
            $table->foreign('ID_MK')
                  ->references('ID_MK')
                  ->on('mata_kuliah')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
            
            $table->index('NIP'); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pertemuan');
    }
};

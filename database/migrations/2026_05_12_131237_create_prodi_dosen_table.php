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
        Schema::create('prodi_dosen', function (Blueprint $table) {
            $table->id('id_prodi_dosen');
            $table->integer('ID_PRODI');
            $table->char('NIP', 20)->nullable();
            $table->timestamps();

            $table->foreign('ID_PRODI')
                  ->references('ID_PRODI')
                  ->on('prodi')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prodi_dosen');
    }
};

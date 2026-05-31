<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mk_krs', function (Blueprint $table) {
            $table->integer('ID_MK')->unsigned();
            $table->integer('ID_KRS')->unsigned();
            $table->timestamps();

            $table->foreign('ID_MK')
                  ->references('ID_MK')
                  ->on('mata_kuliah')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();

            $table->foreign('ID_KRS')
                  ->references('ID_KRS')
                  ->on('krs')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mk_krs');
    }
};

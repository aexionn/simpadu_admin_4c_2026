<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mk_krs', function (Blueprint $table) {
            $table->integer('ID_MK');
            $table->integer('ID_KRS');
            $table->timestamps();

            // FK_MK_KRS2: mk_krs references mata_kuliah
            $table->foreign('ID_MK')
                  ->references('ID_MK')
                  ->on('mata_kuliah')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();

            // FK_MK_KRS: mk_krs references krs
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

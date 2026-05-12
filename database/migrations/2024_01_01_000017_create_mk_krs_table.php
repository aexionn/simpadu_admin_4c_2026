<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mk_krs', function (Blueprint $table) {
            $table->char('KODE_MK', 6);
            $table->integer('ID_KRS');
            $table->timestamps();

            // Composite primary key
            $table->primary(['KODE_MK', 'ID_KRS']);

            // FK_MK_KRS2: mk_krs references mata_kuliah
            $table->foreign('KODE_MK')
                  ->references('KODE_MK')
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

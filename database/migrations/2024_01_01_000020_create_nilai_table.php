<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nilai', function (Blueprint $table) {
            $table->integer('ID_NILAI')->primary();
            $table->integer('ID_KHS');
            $table->char('KODE_MK', 6);
            $table->float('TOTAL_NILAI', 12, 2)->nullable();
            $table->enum('NILAI_HURUF', ['A', 'AB', 'B', 'BC', 'C', 'D', 'E'])->nullable();
            $table->char('NIM', 11)->nullable();
            $table->timestamps();

            // FK_MENYIMPAN_NILAI: nilai belongs to khs
            $table->foreign('ID_KHS')
                  ->references('ID_KHS')
                  ->on('khs')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();

            // FK_MEMILIKI2: nilai belongs to mata_kuliah
            $table->foreign('KODE_MK')
                  ->references('KODE_MK')
                  ->on('mata_kuliah')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nilai');
    }
};

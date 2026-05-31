<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nilai', function (Blueprint $table) {
            $table->increments('ID_NILAI')->primary();
            $table->integer('ID_KHS')->unsigned();
            $table->integer('ID_MK')->unsigned();
            $table->float('TOTAL_NILAI', 12, 2);
            $table->enum('NILAI_HURUF', ['A', 'AB', 'B', 'BC', 'C', 'D', 'E']);
            $table->char('NIM', 11)->nullable();
            $table->timestamps();

            $table->foreign('ID_KHS')
                  ->references('ID_KHS')
                  ->on('khs')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
                  
            $table->foreign('ID_MK')
                  ->references('ID_MK')
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

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mata_kuliah', function (Blueprint $table) {
            $table->integer('ID_MK')->primary();
            $table->string('NAMA_MK', 40)->nullable();
            $table->smallInteger('SEMESTER')->nullable();
            $table->smallInteger('SKS')->nullable();
            $table->smallInteger('JAM')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mata_kuliah');
    }
};

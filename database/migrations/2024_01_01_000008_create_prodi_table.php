<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prodi', function (Blueprint $table) {
            $table->integer('ID_PRODI')->primary();
            $table->integer('ID_JURUSAN');
            $table->string('NAMA_PRODI', 30)->nullable();
            $table->enum('JENJANG', ['D3', 'D4'])->nullable();
            $table->timestamps();

            // FK_MEMILIKI: prodi belongs to jurusan
            $table->foreign('ID_JURUSAN')
                  ->references('ID_JURUSAN')
                  ->on('jurusan')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prodi');
    }
};

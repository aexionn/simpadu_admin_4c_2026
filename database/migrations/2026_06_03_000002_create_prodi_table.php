<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prodi', function (Blueprint $table) {
            $table->unsignedBigInteger('id_prodi')->autoIncrement()->primary();
            $table->string('nama_prodi', 100)->unique();
            $table->string('jenjang', 50);
            $table->unsignedBigInteger('id_jurusan');
            $table->text('visi')->nullable();
            $table->timestamps();

            $table->foreign('id_jurusan')
                ->references('id_jurusan')
                ->on('jurusan')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prodi');
    }
};

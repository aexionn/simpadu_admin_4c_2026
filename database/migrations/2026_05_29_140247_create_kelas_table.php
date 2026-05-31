<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kelas', function (Blueprint $table) {
            $table->increments('ID_KELAS')->primary();
            $table->integer('ID_PRODI')->nullable();
            $table->integer('ID_PROGRAM')->unsigned();
            $table->smallInteger('SEMESTER');
            $table->char('ALIAS', 1);
            $table->string('KELAS_NAMA', 60);
            $table->timestamps();

            $table->foreign('ID_PROGRAM')
                  ->references('ID_PROGRAM')
                  ->on('program_kelas')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};

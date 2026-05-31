<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_kelas', function (Blueprint $table) {
            $table->increments('ID_PROGRAM')->primary();
            $table->string('NAMA_PROGRAM', 20);
            $table->enum('AKTIF', ['Y', 'T'])->default('Y');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_kelas');
    }
};

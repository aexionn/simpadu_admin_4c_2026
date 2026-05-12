<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('krs', function (Blueprint $table) {
            $table->integer('ID_KRS')->primary();
            $table->char('NAMA_KELAS', 2)->nullable();
            $table->char('NIM', 11)->nullable();
            $table->smallInteger('SEMESTER')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('krs');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provinsi', function (Blueprint $table) {
            $table->unsignedInteger('KODE_PROVINSI')->primary();
            $table->string('NAMA_PROVINSI')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provinsi');
    }
};

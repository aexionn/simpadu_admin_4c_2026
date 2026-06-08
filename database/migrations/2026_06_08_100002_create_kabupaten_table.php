<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kabupaten', function (Blueprint $table) {
            $table->unsignedInteger('KODE_KABUPATEN')->primary();
            $table->unsignedInteger('KODE_PROVINSI');
            $table->string('NAMA_KABUPATEN');
            $table->timestamps();

            $table->foreign('KODE_PROVINSI')
                ->references('KODE_PROVINSI')
                ->on('provinsi')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kabupaten');
    }
};

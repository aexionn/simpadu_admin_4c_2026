<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('khs', function (Blueprint $table) {
            $table->integer('ID_KHS')->primary();
            $table->integer('ID_NILAI')->nullable();
            $table->smallInteger('SEMESTER')->nullable();
            $table->char('NIM', 11)->nullable();
            $table->float('IPS', 12, 2)->nullable();
            $table->float('IPK', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('khs');
    }
};

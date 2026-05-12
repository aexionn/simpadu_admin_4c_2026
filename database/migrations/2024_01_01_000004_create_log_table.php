<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log', function (Blueprint $table) {
            $table->integer('ID_LOG')->primary();
            $table->string('TIPE_AKTIVITAS', 20)->nullable();
            $table->string('PESAN', 100)->nullable();
            $table->timestamp('TIMESTAMP')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log');
    }
};

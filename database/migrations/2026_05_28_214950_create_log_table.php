<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log', function (Blueprint $table) {
            $table->increments('ID_LOG')->primary();
            $table->string('TIPE_AKTIVITAS', 30);
            $table->text('PESAN');
            $table->string('ENTITAS_TERKAIT', 100)->nullable();
            $table->timestamp('TIMESTAMP')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log');
    }
};

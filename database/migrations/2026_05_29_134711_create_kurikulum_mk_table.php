<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kurikulum_mk', function (Blueprint $table) {
            $table->increments('ID_KURIKULUM_MK')->primary();
            $table->integer('ID_MK')->unsigned();
            $table->integer('ID_KURIKULUM')->unsigned();
            $table->timestamps();

            $table->foreign('ID_MK')
                  ->references('ID_MK')
                  ->on('mata_kuliah')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();

            $table->foreign('ID_KURIKULUM')
                  ->references('ID_KURIKULUM')
                  ->on('kurikulum')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kurikulum_mk');
    }
};

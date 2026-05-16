<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kurikulum_mk', function (Blueprint $table) {
            $table->integer('ID_MK');
            $table->integer('ID_KURIKULUM');
            $table->timestamps();

            // FK_KURIKULUM_MK2: kurikulum_mk references mata_kuliah
            $table->foreign('ID_MK')
                  ->references('ID_MK')
                  ->on('mata_kuliah')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();

            // FK_KURIKULUM_MK: kurikulum_mk references kurikulum
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

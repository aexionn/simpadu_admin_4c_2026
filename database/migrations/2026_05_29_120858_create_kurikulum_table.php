<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kurikulum', function (Blueprint $table) {
            $table->increments('ID_KURIKULUM')->primary();
            $table->integer('ID_TAHUN_AKADEMIK')->unsigned();
            $table->string('NAMA_KURIKULUM', 40);
            $table->longText('CATATAN_KURIKULUM');
            $table->enum('is_active', ['Y', 'T'])->default('T');
            $table->timestamp('superseded_at');

            $table->foreign('ID_TAHUN_AKADEMIK')
                  ->references('ID_TAHUN_AKADEMIK')
                  ->on('tahun_akademik')
                  ->cascadeOnDelete()
                  ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kurikulum');
    }
};

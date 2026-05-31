<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi_sesi', function (Blueprint $table) {
            $table->increments('ID_SESI')->primary();
            $table->integer('ID_KELAS_MK')->unsigned();
            $table->integer('PERTEMUAN_KE');
            $table->string('session_token', 64)->unique();
            $table->dateTime('expires_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('ID_KELAS_MK')
                  ->references('ID_KELAS_MK')
                  ->on('kelas_mk')
                  ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->index('session_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presensi_sesi');
    }
};

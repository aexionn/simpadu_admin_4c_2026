<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presensi_pegawai', function (Blueprint $table) {
            // $table->dropColumn('NIP');
            // $table->dropIndex('presensi_pegawai_nip_index');

            $table->unsignedInteger('ID_USER')->after('ID_PRESENSI')->nullable();

            $table->foreign('ID_USER')
                ->references('id_user')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('presensi_pegawai', function (Blueprint $table) {
            $table->dropForeign(['id_user']);
            $table->dropColumn('id_user');

            $table->char('NIP', 20)->nullable()->after('ID_PRESENSI');
            $table->index('NIP');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Remove duplicate rows, keeping the oldest one per (id_user, id_role)
        DB::statement('
            DELETE u1 FROM user_roles u1
            INNER JOIN user_roles u2
            WHERE u1.id_user = u2.id_user
              AND u1.id_role = u2.id_role
              AND u1.created_at > u2.created_at
        ');

        // 2. Add unique constraint to prevent future duplicates
        Schema::table('user_roles', function (Blueprint $table) {
            $table->unique(['id_user', 'id_role'], 'user_roles_user_role_unique');
        });
    }

    public function down(): void
    {
        Schema::table('user_roles', function (Blueprint $table) {
            $table->dropUnique('user_roles_user_role_unique');
        });
    }
};

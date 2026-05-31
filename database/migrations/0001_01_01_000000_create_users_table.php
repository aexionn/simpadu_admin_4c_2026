<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id_user')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('is_active', ['Y', 'T'])->default('Y');
            $table->timestamps();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->increments('id_role')->primary();
            $table->string('role_name', 40);
            $table->timestamps();
        });

        Schema::create('user_roles', function (Blueprint $table) {
            $table->integer('id_user')->unsigned();
            $table->integer('id_role')->unsigned();
            $table->timestamps();

            $table->foreign('id_user')->references('id_user')->on('users')->onDelete('cascade');
            $table->foreign('id_role')->references('id_role')->on('roles')->onDelete('cascade');
        });

        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->increments('id_token')->primary();
            $table->integer('id_user')->unsigned()->references('id_user')->on('users')->onDelete('cascade');
            $table->string('jti', 32);
            $table->string('token_hash');
            $table->timestamp('expires_at')->useCurrent();
            $table->timestamp('revoked_at')->nullable();

            $table->index(['id_user', 'token_hash']);
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->integer('user_id')->unsigned()->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};

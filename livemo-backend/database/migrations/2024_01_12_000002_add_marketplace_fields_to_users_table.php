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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['buyer', 'seller', 'both', 'admin'])->default('buyer')->after('email');
            $table->string('phone')->nullable()->after('email');
            $table->json('address')->nullable()->after('phone')->comment('Shipping/billing address');
            $table->string('avatar')->nullable()->after('address');
            $table->boolean('is_verified')->default(false)->after('avatar');
            $table->timestamp('verified_at')->nullable()->after('is_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'address', 'avatar', 'is_verified', 'verified_at']);
        });
    }
};

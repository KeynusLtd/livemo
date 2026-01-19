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
        Schema::table('animals', function (Blueprint $table) {
            $table->boolean('is_for_sale')->default(false)->after('status');
            $table->decimal('marketplace_price', 10, 2)->nullable()->after('is_for_sale');
            $table->enum('marketplace_status', ['draft', 'active', 'sold', 'inactive'])->default('draft')->after('marketplace_price');
            $table->text('marketplace_description')->nullable()->after('marketplace_status');
            
            $table->index(['is_for_sale', 'marketplace_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->dropColumn(['is_for_sale', 'marketplace_price', 'marketplace_status', 'marketplace_description']);
        });
    }
};

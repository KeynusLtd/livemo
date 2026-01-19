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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('sku')->unique();
            $table->integer('stock_quantity')->default(0);
            $table->decimal('weight', 10, 2)->nullable()->comment('Weight in kg');
            $table->json('dimensions')->nullable()->comment('Length, width, height in cm');
            $table->string('brand')->nullable();
            $table->string('manufacturer')->nullable();
            $table->json('specifications')->nullable();
            $table->boolean('requires_prescription')->default(false)->comment('For medical products');
            $table->date('expiry_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('sku');
            $table->index(['category_id', 'stock_quantity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

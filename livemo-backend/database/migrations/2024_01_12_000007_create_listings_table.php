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
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->morphs('listable'); // Polymorphic: Animal, Product, or Service
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('status', ['draft', 'active', 'sold', 'inactive', 'pending_review'])->default('draft');
            $table->boolean('featured')->default(false);
            $table->integer('views_count')->default(0);
            $table->string('location')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('delivery_available')->default(false);
            $table->decimal('delivery_fee', 10, 2)->nullable();
            $table->integer('max_delivery_distance_km')->nullable();
            $table->json('tags')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['listable_type', 'listable_id']);
            $table->index(['seller_id', 'status']);
            $table->index(['status', 'published_at']);
            $table->index('featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};

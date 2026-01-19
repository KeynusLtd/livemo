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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->morphs('reviewable'); // Polymorphic: Listing, Seller, etc.
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('rating')->comment('1-5 stars');
            $table->string('title')->nullable();
            $table->text('comment')->nullable();
            $table->boolean('verified_purchase')->default(false);
            $table->integer('helpful_count')->default(0);
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
            
            $table->index(['reviewable_type', 'reviewable_id']);
            $table->index(['reviewer_id', 'created_at']);
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};

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
        Schema::create('seller_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('business_name');
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->json('verification_documents')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->decimal('rating_average', 3, 2)->default(0)->comment('Average rating 0-5');
            $table->integer('rating_count')->default(0);
            $table->integer('total_sales')->default(0);
            $table->decimal('response_time_hours', 5, 2)->nullable()->comment('Average response time in hours');
            $table->text('bank_account_encrypted')->nullable()->comment('Encrypted bank details');
            $table->string('tax_id')->nullable();
            $table->json('business_hours')->nullable();
            $table->string('website')->nullable();
            $table->json('social_links')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['verification_status', 'is_active']);
            $table->index('rating_average');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_profiles');
    }
};

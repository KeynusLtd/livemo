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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('service_type', ['veterinary', 'transport', 'consulting', 'training', 'breeding', 'other'])->default('other');
            $table->integer('duration_minutes')->nullable()->comment('Estimated service duration');
            $table->json('availability_schedule')->nullable()->comment('Available days/hours');
            $table->boolean('location_based')->default(true);
            $table->integer('max_distance_km')->nullable()->comment('Maximum service radius');
            $table->json('requirements')->nullable()->comment('Prerequisites or requirements');
            $table->boolean('requires_booking')->default(true);
            $table->integer('advance_booking_hours')->default(24)->comment('Minimum hours before booking');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['service_type', 'location_based']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};

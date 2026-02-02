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
        Schema::create('sensor_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sensor_id')->constrained('sensors')->onDelete('cascade');
            $table->foreignId('farm_id')->constrained('farms')->onDelete('cascade');
            $table->foreignId('animal_id')->nullable()->constrained('animals')->onDelete('set null');

            $table->timestamp('recorded_at')->index();

            $table->decimal('temperature', 5, 2)->nullable();
            $table->integer('heart_rate')->nullable();
            $table->integer('activity_level')->nullable();
            $table->integer('battery_level')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['sensor_id', 'recorded_at']);
            $table->index(['farm_id', 'recorded_at']);
            $table->index(['animal_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensor_readings');
    }
};

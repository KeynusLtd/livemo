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
        Schema::create('sensors', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->unique()->comment('Unique sensor device identifier');
            $table->enum('type', ['wearable', 'collar', 'ear_tag', 'environmental', 'camera']);
            $table->foreignId('animal_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['active', 'inactive', 'maintenance', 'lost'])->default('active');
            $table->integer('battery_level')->nullable()->comment('Battery percentage 0-100');
            $table->timestamp('last_communication')->nullable();
            $table->json('configuration')->nullable()->comment('Sensor-specific settings');
            $table->string('firmware_version')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['farm_id', 'status']);
            $table->index('animal_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensors');
    }
};

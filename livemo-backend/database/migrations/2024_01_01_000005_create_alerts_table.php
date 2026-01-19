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
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            $table->foreignId('animal_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('sensor_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', [
                'health_critical',
                'health_warning',
                'temperature_high',
                'temperature_low',
                'low_activity',
                'abnormal_behavior',
                'sensor_offline',
                'battery_low',
                'geofence_breach',
                'missing_animal',
                'environmental'
            ]);
            $table->enum('severity', ['info', 'warning', 'critical'])->default('warning');
            $table->string('title');
            $table->text('message');
            $table->json('metadata')->nullable();
            $table->enum('status', ['pending', 'acknowledged', 'resolved', 'dismissed'])->default('pending');
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('acknowledged_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
            
            $table->index(['farm_id', 'status', 'severity']);
            $table->index(['animal_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};

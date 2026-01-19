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
        Schema::create('monitoring_stations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            $table->string('station_id')->unique()->comment('Unique station identifier');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['camera', 'thermal', 'audio', 'environmental', 'hybrid'])->default('hybrid');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('coverage_area')->nullable()->comment('GeoJSON polygon of coverage');
            $table->integer('coverage_capacity')->nullable()->comment('Max animals it can monitor');
            $table->enum('status', ['active', 'inactive', 'maintenance', 'offline'])->default('active');
            $table->json('camera_config')->nullable()->comment('Camera settings and specs');
            $table->json('ai_models')->nullable()->comment('Deployed AI model versions');
            $table->string('firmware_version')->nullable();
            $table->integer('power_level')->nullable()->comment('Battery/solar percentage');
            $table->timestamp('last_communication')->nullable();
            $table->json('environmental_data')->nullable()->comment('Temperature, humidity, etc');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['farm_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitoring_stations');
    }
};

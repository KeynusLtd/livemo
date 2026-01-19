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
        Schema::create('health_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained()->onDelete('cascade');
            $table->enum('record_type', ['checkup', 'illness', 'injury', 'treatment', 'observation']);
            $table->decimal('temperature', 4, 1)->nullable()->comment('Body temperature in Celsius');
            $table->integer('heart_rate')->nullable()->comment('Beats per minute');
            $table->integer('respiratory_rate')->nullable()->comment('Breaths per minute');
            $table->integer('activity_level')->nullable()->comment('0-100 activity score');
            $table->string('diagnosis')->nullable();
            $table->text('symptoms')->nullable();
            $table->text('treatment')->nullable();
            $table->text('notes')->nullable();
            $table->string('veterinarian')->nullable();
            $table->date('next_checkup')->nullable();
            $table->enum('severity', ['normal', 'mild', 'moderate', 'severe', 'critical'])->default('normal');
            $table->json('vital_signs')->nullable()->comment('Additional vital signs data');
            $table->timestamps();
            
            $table->index(['animal_id', 'created_at']);
            $table->index('severity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('health_records');
    }
};

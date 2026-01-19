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
        Schema::create('pasture_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pasture_id')->constrained()->onDelete('cascade');
            $table->foreignId('animal_id')->constrained()->onDelete('cascade');
            $table->timestamp('assigned_at');
            $table->timestamp('removed_at')->nullable();
            $table->boolean('is_current')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['pasture_id', 'is_current']);
            $table->index(['animal_id', 'is_current']);
            $table->unique(['pasture_id', 'animal_id', 'is_current'], 'unique_current_assignment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pasture_assignments');
    }
};

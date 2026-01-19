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
        Schema::create('pastures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('size', 10, 2)->comment('Size in hectares');
            $table->integer('capacity')->comment('Maximum number of animals');
            $table->integer('current_occupancy')->default(0);
            $table->enum('quality', ['excellent', 'good', 'fair', 'poor'])->default('good');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('boundaries')->nullable()->comment('GeoJSON polygon coordinates');
            $table->date('last_rotation')->nullable();
            $table->date('next_rotation')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['farm_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pastures');
    }
};

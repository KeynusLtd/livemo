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
        Schema::create('breeding_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            $table->foreignId('mother_id')->constrained('animals')->onDelete('cascade');
            $table->foreignId('father_id')->nullable()->constrained('animals')->onDelete('set null');
            $table->enum('method', ['natural', 'artificial_insemination', 'embryo_transfer']);
            $table->date('breeding_date');
            $table->date('expected_birth_date')->nullable();
            $table->date('actual_birth_date')->nullable();
            $table->enum('status', ['planned', 'bred', 'confirmed_pregnant', 'not_pregnant', 'birthed', 'aborted'])->default('planned');
            $table->integer('pregnancy_days')->nullable();
            $table->boolean('is_successful')->nullable();
            $table->integer('offspring_count')->default(0);
            $table->json('offspring_ids')->nullable()->comment('Array of animal IDs');
            $table->text('complications')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['farm_id', 'status']);
            $table->index(['mother_id', 'breeding_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('breeding_records');
    }
};

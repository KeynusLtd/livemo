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
        Schema::create('animals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            $table->string('tag_id')->unique()->comment('RFID or visual tag ID');
            $table->string('name')->nullable();
            $table->enum('type', ['cattle', 'goats', 'sheep', 'poultry', 'swine', 'horses', 'rabbits']);
            $table->string('breed')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->date('birth_date')->nullable();
            $table->decimal('weight', 8, 2)->nullable()->comment('Weight in kg');
            $table->string('color')->nullable();
            $table->text('markings')->nullable();
            $table->enum('status', ['healthy', 'sick', 'quarantine', 'deceased', 'sold'])->default('healthy');
            $table->integer('health_score')->default(100)->comment('0-100 health score');
            $table->foreignId('mother_id')->nullable()->constrained('animals')->onDelete('set null');
            $table->foreignId('father_id')->nullable()->constrained('animals')->onDelete('set null');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['farm_id', 'type']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animals');
    }
};

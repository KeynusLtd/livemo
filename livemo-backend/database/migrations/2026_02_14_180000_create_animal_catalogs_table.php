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
        Schema::create('animal_catalogs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['cattle', 'goats', 'sheep', 'poultry', 'swine', 'horses', 'rabbits']);
            $table->string('breed')->nullable();
            $table->enum('default_gender', ['male', 'female'])->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animal_catalogs');
    }
};

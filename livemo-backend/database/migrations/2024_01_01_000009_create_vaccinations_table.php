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
        Schema::create('vaccinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained()->onDelete('cascade');
            $table->string('vaccine_name');
            $table->string('vaccine_type')->nullable();
            $table->string('batch_number')->nullable();
            $table->date('administered_date');
            $table->date('next_due_date')->nullable();
            $table->string('administered_by')->nullable()->comment('Veterinarian name');
            $table->decimal('dosage', 8, 2)->nullable();
            $table->string('dosage_unit')->nullable()->comment('ml, mg, etc');
            $table->string('administration_route')->nullable()->comment('IM, SC, oral, etc');
            $table->text('side_effects')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_booster')->default(false);
            $table->foreignId('previous_vaccination_id')->nullable()->constrained('vaccinations')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['animal_id', 'administered_date']);
            $table->index('next_due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaccinations');
    }
};

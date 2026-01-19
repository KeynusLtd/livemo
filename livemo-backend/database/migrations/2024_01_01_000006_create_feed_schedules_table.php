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
        Schema::create('feed_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            $table->foreignId('animal_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('group_name')->nullable()->comment('For group feeding');
            $table->string('feed_type');
            $table->decimal('quantity', 8, 2)->comment('Quantity in kg');
            $table->time('scheduled_time');
            $table->json('days_of_week')->nullable()->comment('Array of days: [1,2,3,4,5,6,7]');
            $table->boolean('is_recurring')->default(true);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->json('nutritional_info')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['farm_id', 'scheduled_time']);
            $table->index(['animal_id', 'is_completed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feed_schedules');
    }
};

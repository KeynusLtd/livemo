<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('requested_by_admin_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('status', ['requested', 'processing', 'paid', 'failed', 'cancelled'])->default('requested');
            $table->text('notes')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['seller_id', 'status']);
            $table->index(['requested_by_admin_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payouts');
    }
};

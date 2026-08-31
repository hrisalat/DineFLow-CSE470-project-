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
        Schema::create('operating_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->string('month')->nullable(); // e.g., '2026-08' or null for default
            $table->decimal('rent', 10, 2)->default(0);
            $table->decimal('electricity_bill', 10, 2)->default(0);
            $table->decimal('gas_bill', 10, 2)->default(0);
            $table->decimal('water_bill', 10, 2)->default(0);
            $table->decimal('other_bills', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operating_expenses');
    }
};

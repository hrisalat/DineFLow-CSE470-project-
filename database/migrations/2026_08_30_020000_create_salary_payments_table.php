<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('salary_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('restaurant_id');
            $table->string('month'); // e.g. "2026-08"
            $table->decimal('base_salary', 10, 2);
            $table->integer('absent_days')->default(0);
            $table->decimal('fine_per_day', 10, 2)->default(0);
            $table->decimal('total_fine', 10, 2)->default(0);
            $table->decimal('net_salary', 10, 2);
            $table->timestamp('paid_at')->useCurrent();
            $table->timestamps();

            $table->unique(['employee_id', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_payments');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
        public function up() {
    Schema::create('employees', function ($table) {
        $table->id();
        $table->unsignedBigInteger('restaurant_id');
        $table->string('name');
        $table->string('email')->unique();
        $table->string('phone');
        $table->string('nid_birth_cert');
        $table->string('position');
        $table->string('salary');
        $table->string('photo')->nullable();
        $table->string('unique_id', 10)->unique(); // Your 10-digit ID
        $table->string('password')->nullable();
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};

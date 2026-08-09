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
    Schema::create('restaurants', function ($table) {
        $table->id();
        $table->string('restaurant_name');
        $table->string('email_primary')->unique();
        $table->string('email_secondary')->nullable();
        $table->string('phone');
        $table->string('registration_no');
        $table->string('accent_color')->default('#6366f1');
        $table->string('logo')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};

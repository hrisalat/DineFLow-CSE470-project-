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
    Schema::table('reviews', function (Blueprint $table) {
        // Link review to a specific food item
        $table->foreignId('menu_item_id')->constrained('menu_items')->onDelete('cascade');
        $table->text('comment')->nullable()->change(); // Make comment optional
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

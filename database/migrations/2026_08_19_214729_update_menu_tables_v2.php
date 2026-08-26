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
    // 1. Remove image from categories
    Schema::table('categories', function (Blueprint $table) {
        $table->dropColumn('image');
    });

    // 2. Update menu_items for flexible pricing
    Schema::table('menu_items', function (Blueprint $table) {
            $table->string('price_type')->default('fixed'); // 'fixed' or 'quantity'
            $table->json('price_options')->nullable(); // Stores [{qty: '1:1', price: 200}, ...]
            $table->decimal('price', 10, 2)->nullable()->change(); // Make base price optional
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

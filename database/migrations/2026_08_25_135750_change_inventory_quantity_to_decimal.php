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
    Schema::table('inventories', function (Blueprint $table) {
        // Change from integer to decimal (up to 10 digits, 3 after the decimal point)
        $table->decimal('quantity', 10, 3)->change();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('decimal', function (Blueprint $table) {
            //
        });
    }
};

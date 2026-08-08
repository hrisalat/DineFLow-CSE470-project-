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
    Schema::table('users', function (Blueprint $table) {
        // Only add these if they don't exist
        if (!Schema::hasColumn('users', 'role')) {
            $table->string('role')->default('owner');
            $table->unsignedBigInteger('restaurant_id')->nullable();
        }
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

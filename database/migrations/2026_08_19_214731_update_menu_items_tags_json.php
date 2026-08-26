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
    Schema::table('menu_items', function (Blueprint $table) {
                // Change column to JSON to store up to 3 tags
                $table->json('tags')->nullable()->after('tag');
                $table->dropColumn('tag'); 
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

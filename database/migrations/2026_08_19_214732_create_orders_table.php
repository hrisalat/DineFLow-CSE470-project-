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
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        // Links order to the restaurant
        $table->foreignId('restaurant_id')->constrained('restaurants')->onDelete('cascade');
        
        $table->string('customer_name')->nullable();
        $table->string('customer_phone')->nullable();
        $table->string('service_type'); // dine-in or takeaway
        $table->decimal('total_price', 10, 2);
        $table->string('payment_method'); // cash or bkash
        $table->string('status')->default('confirmed');
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model {
    protected $fillable = ['restaurant_id', 'item_name', 'quantity', 'unit', 'expiry_date', 'purchase_price'];
}
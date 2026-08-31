<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CustomerWaste extends Model {
    protected $fillable = ['restaurant_id', 'menu_item_id', 'quantity', 'date'];
    public function menuItem() {
         return $this->belongsTo(MenuItem::class, 'menu_item_id');
          }

}
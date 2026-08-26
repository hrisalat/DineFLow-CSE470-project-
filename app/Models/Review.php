<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    // Ensure menu_item_id is added here
    protected $fillable = [
        'user_id', 
        'restaurant_id', 
        'menu_item_id', 
        'rating', 
        'comment'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function menuItem() {
        return $this->belongsTo(MenuItem::class);
    }
}
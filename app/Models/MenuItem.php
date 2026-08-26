<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = ['category_id', 'name', 'description', 'price', 'image', 'tags', 'price_type', 'price_options'];

    protected $casts = [
        'tags' => 'array',
        'price_options' => 'array'
    ];

    // ADD THIS RELATIONSHIP - Laravel crashes without this!
    public function ingredients()
    {
        return $this->hasMany(MenuItemIngredient::class, 'menu_item_id');
    }

    public function reviews() {
    return $this->hasMany(Review::class);
}

// Accessor to get average rating
public function getAverageRatingAttribute() {
    return round($this->reviews()->avg('rating'), 1) ?: 0;
}

protected $appends = ['average_rating']; // Add to JSON output
    }

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = ['category_id', 'name', 'description', 'price', 'image', 'tag', 'price_type', 'price_options'];

    // Important: Tell Laravel to treat price_options as an array automatically
    protected $casts = [
        'price_options' => 'array',
    ];

    public function ingredients() {
        return $this->hasMany(MenuItemIngredient::class);
    }
    }

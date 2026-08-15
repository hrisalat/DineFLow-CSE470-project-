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
    public function ingredients() {
        return $this->hasMany(MenuItemIngredient::class);
    }
    }

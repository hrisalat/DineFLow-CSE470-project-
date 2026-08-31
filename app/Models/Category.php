<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    // This array tells Laravel these columns are safe to save data into
    protected $fillable = [
        'restaurant_id', 
        'name', 
        'description'
    ];

    /**
     * Get the items for the category.
     */
    public function items()
    {
        
        return $this->hasMany(MenuItem::class, 'category_id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    // This allows Laravel to save these fields to the database
    protected $fillable = ['restaurant_id', 'name', 'description'];

    public function items() {
        return $this->hasMany(MenuItem::class);
    }
}
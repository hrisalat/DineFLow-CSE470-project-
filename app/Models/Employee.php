<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    // These MUST match the names in your migration and form
    protected $fillable = [
        'restaurant_id', 
        'name', 
        'email', 
        'phone', 
        'nid_birth_cert', 
        'position', 
        'salary', 
        'photo', 
        'unique_id'
    ];
}
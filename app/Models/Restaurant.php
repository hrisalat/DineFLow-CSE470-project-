<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    protected $fillable = [
        'restaurant_name', 
        'email_primary', 
        'email_secondary', 
        'phone', 
        'registration_no', 
        'accent_color', 
        'logo',
        'is_website_active',
        'slug'
    ];
}
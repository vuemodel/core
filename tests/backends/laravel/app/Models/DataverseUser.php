<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DataverseUser extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'userid';

    public $incrementing = false;

    protected $guarded = [];

    public function albums(): HasMany
    {
        return $this->hasMany(\App\Models\Album::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(\App\Models\Post::class);
    }
}

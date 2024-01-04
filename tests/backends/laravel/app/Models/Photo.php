<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Photo extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    public function album(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Album::class);
    }

    public function photoTags(): HasMany
    {
        return $this->hasMany(\App\Models\PhotoTag::class);
    }
}

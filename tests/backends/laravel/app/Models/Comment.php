<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    protected $casts = [
        'commented_on' => 'datetime',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Post::class);
    }
}

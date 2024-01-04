<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class CommentsController extends Controller
{
    use DisableAuthorization;

    protected $model = Comment::class;

    public function filterableBy(): array
    {
        return ['*'];
    }

    public function includes(): array
    {
        return ['*'];
    }

    public function sortableBy(): array
    {
        return ['*'];
    }

    public function aggregates(): array
    {
        return ['*'];
    }
}

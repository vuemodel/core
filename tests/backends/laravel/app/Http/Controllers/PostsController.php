<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class PostsController extends Controller
{
    use DisableAuthorization;

    protected $model = Post::class;

    public function filterableBy(): array
    {
        return ['*'];
    }

    public function includes(): array
    {
        return ['comments', 'post', '*', 'comments.post', 'user.albums', 'user'];
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

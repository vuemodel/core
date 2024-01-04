<?php

namespace App\Http\Controllers;

use App\Models\User;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class UsersController extends Controller
{
    use DisableAuthorization;

    protected $model = User::class;

    public function filterableBy(): array
    {
        return ['*'];
    }

    public function includes(): array
    {
        return ['*', 'posts', 'comments', 'posts.comments'];
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

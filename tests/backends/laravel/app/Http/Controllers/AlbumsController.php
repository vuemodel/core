<?php

namespace App\Http\Controllers;

use App\Models\Album;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class AlbumsController extends Controller
{
    use DisableAuthorization;

    protected $model = Album::class;

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

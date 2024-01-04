<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class PhotosController extends Controller
{
    use DisableAuthorization;

    protected $model = Photo::class;

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

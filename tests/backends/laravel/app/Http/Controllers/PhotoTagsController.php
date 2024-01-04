<?php

namespace App\Http\Controllers;

use App\Models\PhotoTag;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class PhotoTagsController extends Controller
{
    use DisableAuthorization;

    protected $model = PhotoTag::class;

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

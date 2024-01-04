<?php

namespace App\Http\Controllers;

use App\Models\DataverseUser;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class DataverseUsersController extends Controller
{
    use DisableAuthorization;

    protected $model = DataverseUser::class;

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

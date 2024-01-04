<?php

namespace App\Http\Requests;

use Orion\Http\Requests\Request;

class UserRequest extends Request
{
    public function storeRules(): array
    {
        return [
            'email' => 'required|email|min:10',
        ];
    }

    public function updateRules(): array
    {
        return [
            'email' => 'email|min:10',
        ];
    }
}

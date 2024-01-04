<?php

namespace App\Http\Requests;

use Orion\Http\Requests\Request;

class PostRequest extends Request
{
    public function storeRules(): array
    {
        return [
            'title' => 'required',
        ];
    }
}

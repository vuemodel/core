<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/beep', function (Request $request) {
    // Specify the path to your JSON file
    $usersJsonFilePath = base_path('node_modules/@vuemodel/sample-data/dist/json/users.json');

    // Read the file contents
    $jsonString = file_get_contents($usersJsonFilePath);

    // Decode JSON data to PHP array
    $dataArray = json_decode($jsonString, true);

    return $dataArray;
});

Route::get('/seed/{entityName}/{numberOfRecords?}', function (string $entityName, ?string $numberOfRecords = null) {
    return [$entityName, $numberOfRecords];
});

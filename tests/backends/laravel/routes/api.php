<?php

use App\Helpers\ModelHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Orion\Facades\Orion;

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

Route::get('/seed/all', function (Request $request) {
    ModelHelper::seedAll();
});

Route::get('/seed/{entityName}/{numberOfRecords?}', function (string $entityName, ?string $numberOfRecords = null) {
    ModelHelper::seed($entityName, $numberOfRecords);
    return 'success';
});

Route::get('/artisan/{command}', function (string $command) {
    Artisan::call($command);
    return 'success';
});

Route::group(['as' => 'api.'], function () {
    Orion::resource('posts', \App\Http\Controllers\PostsController::class);
    Orion::resource('albums', \App\Http\Controllers\AlbumsController::class);
    Orion::resource('comments', \App\Http\Controllers\CommentsController::class);
    Orion::resource('dataverse_users', \App\Http\Controllers\DataverseUsersController::class);
    Orion::resource('photos', \App\Http\Controllers\PhotosController::class);
    Orion::resource('photoTags', \App\Http\Controllers\PhotoTagsController::class);
    Orion::resource('posts', \App\Http\Controllers\PostsController::class);
    Orion::resource('users', \App\Http\Controllers\UsersController::class);
});

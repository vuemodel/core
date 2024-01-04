<?php

namespace App\Helpers;

use Illuminate\Container\Container;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;


class ModelHelper
{
    const SEED_MAP = [
        "users" => "\App\Models\User",
        "dataverse_users" => "\App\Models\DataverseUser",
        "posts" => "\App\Models\Post",
        "comments" => "\App\Models\Comment",
        "albums" => "\App\Models\Album",
        "photos" => "\App\Models\Photo",
        "photo_tags" => "\App\Models\PhotoTag",
    ];

    static function getModels(): Collection
    {
        $models = collect(File::allFiles(app_path()))
            ->map(function ($item) {
                $path = $item->getRelativePathName();
                $class = sprintf(
                    '\%s%s',
                    Container::getInstance()->getNamespace(),
                    strtr(substr($path, 0, strrpos($path, '.')), '/', '\\')
                );

                return $class;
            })
            ->filter(function ($class) {
                $valid = false;

                if (class_exists($class)) {
                    $reflection = new \ReflectionClass($class);
                    $valid = $reflection->isSubclassOf(Model::class) &&
                        !$reflection->isAbstract();
                }

                return $valid;
            });

        return $models->values();
    }

    static function seed(string $entity, int $numberOfRecords = null)
    {
        $Class = static::SEED_MAP[$entity];
        $entity = Str::camel(with(new $Class)->getTable());
        $usersJsonFilePath = base_path("node_modules/@vuemodel/sample-data/dist/json/$entity.json");
        $jsonString = file_get_contents($usersJsonFilePath);
        $dataArray = json_decode($jsonString, true);

        if ($numberOfRecords) {
            $dataArray = collect($dataArray)->take($numberOfRecords)->toArray();
        }

        $Class::insert($dataArray);
    }

    static function seedAll()
    {
        foreach (static::SEED_MAP as $entity => $Model) {
            static::seed($entity);
        }
    }
}

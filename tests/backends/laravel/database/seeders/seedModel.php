<?php

namespace Database\Seeders;

function seedModel(string $Class)
{
    $tableName = with(new $Class)->getTable();

    $usersJsonFilePath = base_path("node_modules/@vuemodel/sample-data/dist/json/$tableName.json");
    $jsonString = file_get_contents($usersJsonFilePath);
    $dataArray = json_decode($jsonString, true);
    $Class::insert($dataArray);
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Specify the path to your JSON file
        $jsonFilePath = storage_path('yourfile.json');

        // Read the file contents
        $jsonString = file_get_contents($jsonFilePath);

        // Decode JSON data to PHP array
        $dataArray = json_decode($jsonString, true);
    }
}

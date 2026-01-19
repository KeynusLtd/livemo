<?php

namespace Database\Seeders;

use App\Models\Farm;
use App\Models\Animal;
use App\Models\Sensor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo user
        $user = User::create([
            'name' => 'Demo Farmer',
            'email' => 'demo@livemo.com',
            'password' => Hash::make('password'),
            'phone' => '+250788123456',
        ]);

        // Create demo farm
        $farm = Farm::create([
            'user_id' => $user->id,
            'name' => 'Green Valley Farm',
            'description' => 'A demonstration farm for Livemo platform',
            'location' => 'Kigali, Rwanda',
            'size' => 50.5,
            'latitude' => -1.9536,
            'longitude' => 30.0606,
            'contact_phone' => '+250788123456',
            'contact_email' => 'demo@livemo.com',
            'city' => 'Kigali',
            'country' => 'RW',
        ]);

        // Create demo animals
        $animals = [
            [
                'tag_id' => 'COW001',
                'name' => 'Bella',
                'type' => 'cattle',
                'breed' => 'Ankole',
                'gender' => 'female',
                'birth_date' => now()->subYears(3),
                'weight' => 450.5,
                'color' => 'Brown',
                'status' => 'healthy',
                'health_score' => 95,
            ],
            [
                'tag_id' => 'COW002',
                'name' => 'Daisy',
                'type' => 'cattle',
                'breed' => 'Friesian',
                'gender' => 'female',
                'birth_date' => now()->subYears(2),
                'weight' => 380.0,
                'color' => 'Black and White',
                'status' => 'healthy',
                'health_score' => 92,
            ],
            [
                'tag_id' => 'GOAT001',
                'name' => 'Billy',
                'type' => 'goats',
                'breed' => 'Boer',
                'gender' => 'male',
                'birth_date' => now()->subYears(1),
                'weight' => 65.0,
                'color' => 'White',
                'status' => 'healthy',
                'health_score' => 88,
            ],
        ];

        foreach ($animals as $animalData) {
            $animal = Animal::create(array_merge($animalData, ['farm_id' => $farm->id]));

            // Create a sensor for each animal
            Sensor::create([
                'device_id' => 'SENSOR_' . $animal->tag_id,
                'type' => 'collar',
                'animal_id' => $animal->id,
                'farm_id' => $farm->id,
                'status' => 'active',
                'battery_level' => rand(60, 100),
                'last_communication' => now(),
            ]);
        }

        $this->command->info('Demo data seeded successfully!');
    }
}

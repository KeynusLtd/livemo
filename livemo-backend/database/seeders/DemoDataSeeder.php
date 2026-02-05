<?php

namespace Database\Seeders;

use App\Models\Farm;
use App\Models\Animal;
use App\Models\Alert;
use App\Models\AlertAction;
use App\Models\BreedingRecord;
use App\Models\FeedSchedule;
use App\Models\HealthRecord;
use App\Models\Pasture;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use App\Models\Vaccination;
use App\Models\Marketplace\Category;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\ListingImage;
use App\Models\Marketplace\Order;
use App\Models\Marketplace\OrderItem;
use App\Models\Marketplace\Product;
use App\Models\Announcement;
use App\Models\ContentPage;
use App\Models\Dispute;
use App\Models\EscrowTransaction;
use App\Models\FooterContent;
use App\Models\ListingReport;
use App\Models\Payout;
use App\Models\PlatformSetting;
use App\Models\RefundRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed users (admin, demo farmer, demo buyer, extra farmers for multi-farm testing)
        $admin = User::firstOrCreate(
            ['email' => 'admin@livemo.com'],
            [
                'name' => 'Livemo Admin',
                'password' => Hash::make('password'),
                'phone' => '+250788000000',
                'role' => 'admin',
                'status' => 'active',
                'is_verified' => true,
                'verified_at' => now(),
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'demo@livemo.com'],
            [
                'name' => 'Demo Farmer',
                'password' => Hash::make('password'),
                'phone' => '+250788123456',
                'role' => 'farmer',
                'status' => 'active',
                'is_verified' => true,
                'verified_at' => now(),
            ]
        );

        $buyer = User::firstOrCreate(
            ['email' => 'buyer@livemo.com'],
            [
                'name' => 'Demo Buyer',
                'password' => Hash::make('password'),
                'phone' => '+250788999999',
                'role' => 'user',
                'status' => 'active',
                'is_verified' => true,
                'verified_at' => now(),
            ]
        );

        // Extra farmers for multi-farm testing
        $farmer2 = User::firstOrCreate(
            ['email' => 'farmer2@livemo.com'],
            [
                'name' => 'Second Farmer',
                'password' => Hash::make('password'),
                'phone' => '+250788222222',
                'role' => 'farmer',
                'status' => 'active',
                'is_verified' => true,
                'verified_at' => now(),
            ]
        );

        $farmer3 = User::firstOrCreate(
            ['email' => 'farmer3@livemo.com'],
            [
                'name' => 'Third Farmer',
                'password' => Hash::make('password'),
                'phone' => '+250788333333',
                'role' => 'farmer',
                'status' => 'active',
                'is_verified' => true,
                'verified_at' => now(),
            ]
        );

        // Create demo farm
        $farm = Farm::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Green Valley Farm'],
            [
                'description' => 'A demonstration farm for Livemo platform',
                'location' => 'Kigali, Rwanda',
                'size' => 50.5,
                'latitude' => -1.9536,
                'longitude' => 30.0606,
                'contact_phone' => '+250788123456',
                'contact_email' => 'demo@livemo.com',
                'city' => 'Kigali',
                'country' => 'RW',
            ]
        );

        // Create a second farm for multi-farm dashboards
        $farm2 = Farm::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Hillside Ranch'],
            [
                'description' => 'Secondary demo farm to validate multi-farm UI',
                'location' => 'Musanze, Rwanda',
                'size' => 24.0,
                'latitude' => -1.4999,
                'longitude' => 29.6340,
                'contact_phone' => '+250788123456',
                'contact_email' => 'demo@livemo.com',
                'city' => 'Musanze',
                'country' => 'RW',
            ]
        );

        // Farms for extra farmers
        $farmFarmer2 = Farm::firstOrCreate(
            ['user_id' => $farmer2->id, 'name' => 'Sunrise Farm'],
            [
                'description' => 'Farm for second demo user',
                'location' => 'Rubavu, Rwanda',
                'size' => 18.0,
                'latitude' => -1.5055,
                'longitude' => 29.2583,
                'contact_phone' => '+250788222222',
                'contact_email' => 'farmer2@livemo.com',
                'city' => 'Rubavu',
                'country' => 'RW',
            ]
        );

        $farmFarmer3 = Farm::firstOrCreate(
            ['user_id' => $farmer3->id, 'name' => 'Meadow Farm'],
            [
                'description' => 'Farm for third demo user',
                'location' => 'Huye, Rwanda',
                'size' => 12.5,
                'latitude' => -2.5970,
                'longitude' => 29.7399,
                'contact_phone' => '+250788333333',
                'contact_email' => 'farmer3@livemo.com',
                'city' => 'Huye',
                'country' => 'RW',
            ]
        );

        // Create demo animals (farm 1)
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

        $createdAnimals = [];
        foreach ($animals as $animalData) {
            $animal = Animal::firstOrCreate(
                ['tag_id' => $animalData['tag_id']],
                array_merge($animalData, ['farm_id' => $farm->id])
            );
            $createdAnimals[] = $animal;

            // Create a sensor for each animal
            $sensor = Sensor::firstOrCreate(
                ['device_id' => 'SENSOR_' . $animal->tag_id],
                [
                    'type' => 'collar',
                    'animal_id' => $animal->id,
                    'farm_id' => $farm->id,
                    'status' => 'active',
                    'battery_level' => rand(60, 100),
                    'last_communication' => now(),
                ]
            );

            // Create sensor readings history (last 24 hours, every 2 hours)
            for ($i = 0; $i < 12; $i++) {
                $t = now()->subHours(24 - ($i * 2));
                $temp = $animal->tag_id === 'COW001' && $i >= 10 ? 40.6 : (38.2 + (rand(-5, 8) / 10));
                $hr = $animal->type === 'cattle' ? rand(55, 75) : rand(70, 95);

                SensorReading::create([
                    'sensor_id' => $sensor->id,
                    'farm_id' => $farm->id,
                    'animal_id' => $animal->id,
                    'recorded_at' => $t,
                    'temperature' => $temp,
                    'heart_rate' => $hr,
                    'activity_level' => rand(40, 95),
                    'battery_level' => $sensor->battery_level,
                    'metadata' => ['source' => 'demo_seeder'],
                ]);
            }

            // Create health records (observations) for dashboards
            HealthRecord::create([
                'animal_id' => $animal->id,
                'record_type' => 'checkup',
                'temperature' => 38.6,
                'heart_rate' => $animal->type === 'cattle' ? 65 : 85,
                'activity_level' => rand(60, 95),
                'diagnosis' => null,
                'symptoms' => null,
                'treatment' => null,
                'notes' => 'Routine checkup (demo)',
                'veterinarian' => 'Dr. Demo',
                'severity' => 'normal',
            ]);

            // Vaccination schedule
            Vaccination::firstOrCreate(
                ['animal_id' => $animal->id, 'vaccine_name' => 'FMD Vaccine', 'administered_date' => now()->subMonths(6)->toDateString()],
                [
                    'vaccine_type' => 'routine',
                    'batch_number' => 'BATCH-' . strtoupper(Str::random(6)),
                    'next_due_date' => now()->addMonths(6)->toDateString(),
                    'administered_by' => 'Dr. Demo',
                    'dosage' => 2.0,
                    'dosage_unit' => 'ml',
                    'administration_route' => 'IM',
                    'notes' => 'Demo vaccination record',
                    'is_booster' => false,
                ]
            );
        }

        // Ensure we have enough animals to create 20+ livestock marketplace listings
        $animalTypes = ['cattle', 'goats', 'sheep', 'poultry', 'swine', 'horses'];
        $animalBreeds = ['Ankole', 'Friesian', 'Boer', 'Dorper', 'Merino', 'Kuroiler', 'Large White', 'Arabian', 'Saanen'];
        while (count($createdAnimals) < 22) {
            $i = count($createdAnimals) + 1;
            $type = $animalTypes[($i - 1) % count($animalTypes)];
            $breed = $animalBreeds[($i - 1) % count($animalBreeds)];
            $tagId = 'LST' . strtoupper(substr($type, 0, 2)) . str_pad((string) $i, 3, '0', STR_PAD_LEFT);

            $createdAnimals[] = Animal::firstOrCreate(
                ['tag_id' => $tagId],
                [
                    'farm_id' => $farm->id,
                    'tag_id' => $tagId,
                    'name' => 'Demo ' . ucfirst($type) . ' ' . $i,
                    'type' => $type,
                    'breed' => $breed,
                    'gender' => ($i % 2 === 0) ? 'female' : 'male',
                    'birth_date' => now()->subMonths(rand(6, 60)),
                    'weight' => rand(35, 650),
                    'color' => 'Brown',
                    'status' => 'healthy',
                    'health_score' => rand(75, 99),
                ]
            );
        }

        // Farm 2 animals to validate multi-farm
        $farm2Animals = [
            [
                'tag_id' => 'SHEEP001',
                'name' => 'Cotton',
                'type' => 'sheep',
                'breed' => 'Merino',
                'gender' => 'female',
                'birth_date' => now()->subYears(2),
                'weight' => 55.0,
                'color' => 'White',
                'status' => 'healthy',
                'health_score' => 90,
            ],
            [
                'tag_id' => 'PIG001',
                'name' => 'Porky',
                'type' => 'swine',
                'breed' => 'Large White',
                'gender' => 'male',
                'birth_date' => now()->subYears(1),
                'weight' => 95.0,
                'color' => 'Pink',
                'status' => 'healthy',
                'health_score' => 86,
            ],
        ];

        $farm2CreatedAnimals = [];
        foreach ($farm2Animals as $animalData) {
            $animal = Animal::firstOrCreate(
                ['tag_id' => $animalData['tag_id']],
                array_merge($animalData, ['farm_id' => $farm2->id])
            );
            $farm2CreatedAnimals[] = $animal;

            $sensor = Sensor::firstOrCreate(
                ['device_id' => 'SENSOR_' . $animal->tag_id],
                [
                    'type' => 'ear_tag',
                    'animal_id' => $animal->id,
                    'farm_id' => $farm2->id,
                    'status' => 'active',
                    'battery_level' => rand(45, 95),
                    'last_communication' => now()->subMinutes(rand(0, 25)),
                ]
            );

            SensorReading::create([
                'sensor_id' => $sensor->id,
                'farm_id' => $farm2->id,
                'animal_id' => $animal->id,
                'recorded_at' => now()->subMinutes(10),
                'temperature' => 38.4,
                'heart_rate' => rand(60, 95),
                'activity_level' => rand(40, 95),
                'battery_level' => $sensor->battery_level,
                'metadata' => ['source' => 'demo_seeder'],
            ]);
        }

        // Seed 20+ active livestock marketplace listings with primary images
        $livestockImageUrls = [
            'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1527153932930-b1c6b3b64e0b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop',
        ];

        foreach (array_slice($createdAnimals, 0, 22) as $idx => $animal) {
            $livestockListing = Listing::firstOrCreate(
                ['listable_type' => Animal::class, 'listable_id' => $animal->id, 'seller_id' => $user->id],
                [
                    'title' => ($animal->name ?: $animal->type) . ' - ' . ($animal->breed ?: 'Quality Breed'),
                    'description' => 'Demo livestock listing generated by seeder.',
                    'price' => 450 + ($idx * 55),
                    'currency' => 'USD',
                    'status' => 'active',
                    'featured' => $idx < 6,
                    'location' => $farm->location,
                    'delivery_available' => true,
                    'delivery_fee' => 25.00,
                    'max_delivery_distance_km' => 100,
                    'tags' => array_filter([$animal->type, $animal->breed]),
                    'published_at' => now(),
                    'expires_at' => now()->addDays(30),
                ]
            );

            ListingImage::firstOrCreate(
                ['listing_id' => $livestockListing->id, 'path' => $livestockImageUrls[$idx % count($livestockImageUrls)]],
                [
                    'order' => 0,
                    'is_primary' => true,
                    'mime_type' => 'image/jpeg',
                ]
            );
        }

        // Minimal animals/sensors/readings for extra farmers (so their dashboards aren’t empty)
        foreach ([$farmFarmer2, $farmFarmer3] as $idx => $extraFarm) {
            $extraAnimal = Animal::firstOrCreate(
                ['tag_id' => 'EXTRA' . ($idx + 1) . '001'],
                [
                    'farm_id' => $extraFarm->id,
                    'name' => 'Demo Animal ' . ($idx + 1),
                    'type' => 'cattle',
                    'breed' => 'Local',
                    'gender' => 'female',
                    'birth_date' => now()->subYears(2),
                    'weight' => 300.0,
                    'color' => 'Brown',
                    'status' => 'healthy',
                    'health_score' => 85,
                ]
            );

            $extraSensor = Sensor::firstOrCreate(
                ['device_id' => 'SENSOR_EXTRA' . ($idx + 1) . '001'],
                [
                    'type' => 'collar',
                    'animal_id' => $extraAnimal->id,
                    'farm_id' => $extraFarm->id,
                    'status' => 'active',
                    'battery_level' => rand(50, 95),
                    'last_communication' => now()->subMinutes(rand(0, 30)),
                ]
            );

            SensorReading::create([
                'sensor_id' => $extraSensor->id,
                'farm_id' => $extraFarm->id,
                'animal_id' => $extraAnimal->id,
                'recorded_at' => now()->subMinutes(5),
                'temperature' => 38.2,
                'heart_rate' => rand(60, 80),
                'activity_level' => rand(45, 90),
                'battery_level' => $extraSensor->battery_level,
                'metadata' => ['source' => 'demo_seeder'],
            ]);
        }

        // Pastures + assignments (farm 1)
        $pastureA = Pasture::firstOrCreate(
            ['farm_id' => $farm->id, 'name' => 'Pasture A'],
            [
                'description' => 'Main grazing paddock',
                'size' => 10.5,
                'capacity' => 80,
                'current_occupancy' => 0,
                'quality' => 'good',
                'last_rotation' => now()->subDays(20)->toDateString(),
                'next_rotation' => now()->addDays(5)->toDateString(),
                'notes' => 'Rotate in 5 days',
                'is_active' => true,
            ]
        );
        $pastureB = Pasture::firstOrCreate(
            ['farm_id' => $farm->id, 'name' => 'Pasture B'],
            [
                'description' => 'Secondary paddock',
                'size' => 6.2,
                'capacity' => 40,
                'current_occupancy' => 0,
                'quality' => 'excellent',
                'last_rotation' => now()->subDays(35)->toDateString(),
                'next_rotation' => now()->addDays(12)->toDateString(),
                'is_active' => true,
            ]
        );

        foreach ($createdAnimals as $idx => $animal) {
            if ($idx === 0) {
                $pastureA->assignAnimal($animal->id, 'Demo assignment');
            } else {
                $pastureB->assignAnimal($animal->id, 'Demo assignment');
            }
        }

        // Feed schedules (farm 1)
        FeedSchedule::firstOrCreate(
            ['farm_id' => $farm->id, 'feed_type' => 'Hay + Grain Mix', 'scheduled_time' => '06:00:00'],
            [
                'group_name' => 'Dairy Cows',
                'quantity' => 30.0,
                'days_of_week' => [1,2,3,4,5,6,7],
                'is_recurring' => true,
                'is_completed' => false,
                'notes' => 'Morning feeding (demo)',
            ]
        );
        FeedSchedule::firstOrCreate(
            ['farm_id' => $farm->id, 'feed_type' => 'Pellets', 'scheduled_time' => '09:30:00'],
            [
                'group_name' => 'Goats',
                'quantity' => 8.0,
                'days_of_week' => [1,2,3,4,5,6,7],
                'is_recurring' => true,
                'is_completed' => true,
                'completed_at' => now()->subHours(2),
                'completed_by' => $user->id,
                'notes' => 'Completed (demo)',
            ]
        );

        // Breeding record (farm 1)
        if (count($createdAnimals) >= 2) {
            $mother = $createdAnimals[0];
            $father = $createdAnimals[1];

            $breeding = BreedingRecord::firstOrCreate(
                ['farm_id' => $farm->id, 'mother_id' => $mother->id, 'breeding_date' => now()->subDays(60)->toDateString()],
                [
                    'father_id' => $father->id,
                    'method' => 'natural',
                    'status' => 'confirmed_pregnant',
                    'notes' => 'Demo breeding record',
                ]
            );

            if (!$breeding->expected_birth_date) {
                $breeding->loadMissing('mother');
                $breeding->calculateExpectedBirthDate();
            }
        }

        // Alerts + actions (farm 1)
        if (count($createdAnimals) > 0) {
            $animal = $createdAnimals[0];
            $sensor = Sensor::where('animal_id', $animal->id)->first();

            $alert = Alert::create([
                'farm_id' => $farm->id,
                'animal_id' => $animal->id,
                'sensor_id' => $sensor?->id,
                'type' => 'health_critical',
                'severity' => 'critical',
                'title' => 'High Temperature',
                'message' => "{$animal->tag_id} temperature is elevated (demo)",
                'metadata' => ['pasture_id' => $pastureA->id],
                'status' => 'pending',
            ]);

            AlertAction::create([
                'alert_id' => $alert->id,
                'user_id' => $user->id,
                'action_type' => 'created',
                'notes' => 'Created by demo seeder',
            ]);
        }

        $feedCategory = Category::firstOrCreate(
            ['slug' => 'animal-feed'],
            [
                'name' => 'Animal Feed',
                'description' => 'Feed and supplements',
                'type' => 'product',
                'order' => 1,
                'is_active' => true,
            ]
        );

        $healthCategory = Category::firstOrCreate(
            ['slug' => 'animal-health'],
            [
                'name' => 'Animal Health',
                'description' => 'Veterinary and health products',
                'type' => 'product',
                'order' => 2,
                'is_active' => true,
            ]
        );

        $product1 = Product::firstOrCreate(
            ['sku' => 'FEED-001'],
            [
                'category_id' => $feedCategory->id,
                'name' => 'Premium Cattle Feed (50kg)',
                'description' => 'High nutrition feed suitable for dairy and beef cattle.',
                'stock_quantity' => 120,
                'weight' => 50,
                'brand' => 'LivemoFeeding',
                'manufacturer' => 'Livemo Supplies',
                'specifications' => ['protein' => '16%', 'fiber' => '10%'],
                'requires_prescription' => false,
            ]
        );

        $product2 = Product::firstOrCreate(
            ['sku' => 'HLTH-001'],
            [
                'category_id' => $healthCategory->id,
                'name' => 'Deworming Tablets',
                'description' => 'Broad-spectrum dewormer for livestock.',
                'stock_quantity' => 300,
                'brand' => 'VetCare',
                'manufacturer' => 'VetCare Ltd.',
                'specifications' => ['dosage' => '1 tablet / 50kg'],
                'requires_prescription' => false,
            ]
        );

        $listing1 = Listing::firstOrCreate(
            ['listable_type' => Product::class, 'listable_id' => $product1->id, 'seller_id' => $user->id],
            [
                'title' => 'Premium Cattle Feed - 50kg',
                'description' => 'Fresh stock available. Delivery options in Kigali.',
                'price' => 35.00,
                'currency' => 'USD',
                'status' => 'active',
                'featured' => true,
                'location' => 'Kigali, Rwanda',
                'delivery_available' => true,
                'delivery_fee' => 2.00,
                'max_delivery_distance_km' => 30,
                'tags' => ['feed', 'cattle'],
                'published_at' => now(),
                'expires_at' => now()->addDays(30),
            ]
        );

        $listing2 = Listing::firstOrCreate(
            ['listable_type' => Product::class, 'listable_id' => $product2->id, 'seller_id' => $user->id],
            [
                'title' => 'Deworming Tablets - VetCare',
                'description' => 'Effective and safe for goats and cattle.',
                'price' => 8.50,
                'currency' => 'USD',
                'status' => 'active',
                'featured' => false,
                'location' => 'Kigali, Rwanda',
                'delivery_available' => true,
                'delivery_fee' => 1.00,
                'max_delivery_distance_km' => 25,
                'tags' => ['health', 'vet'],
                'published_at' => now(),
                'expires_at' => now()->addDays(30),
            ]
        );

        // Add primary images for the base product listings
        ListingImage::firstOrCreate(
            ['listing_id' => $listing1->id, 'path' => 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop'],
            [
                'order' => 0,
                'is_primary' => true,
                'mime_type' => 'image/jpeg',
            ]
        );

        ListingImage::firstOrCreate(
            ['listing_id' => $listing2->id, 'path' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop'],
            [
                'order' => 0,
                'is_primary' => true,
                'mime_type' => 'image/jpeg',
            ]
        );

        // Seed additional product listings to reach 20+
        $equipmentCategory = Category::firstOrCreate(
            ['slug' => 'farm-equipment'],
            [
                'name' => 'Farm Equipment',
                'description' => 'Tools and equipment',
                'type' => 'product',
                'order' => 3,
                'is_active' => true,
            ]
        );

        $supplementsCategory = Category::firstOrCreate(
            ['slug' => 'supplements'],
            [
                'name' => 'Supplements',
                'description' => 'Supplements and nutrition boosters',
                'type' => 'product',
                'order' => 4,
                'is_active' => true,
            ]
        );

        $productImageUrls = [
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1582582621959-48d27397dc5a?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1586201375761-83865001e17b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600172454284-934feca24ccd?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1599045118108-bf9954418b76?w=800&h=600&fit=crop',
        ];

        $productCategories = [$feedCategory, $healthCategory, $equipmentCategory, $supplementsCategory];
        for ($i = 3; $i <= 22; $i++) {
            $cat = $productCategories[($i - 3) % count($productCategories)];
            $sku = 'PROD-' . str_pad((string) $i, 3, '0', STR_PAD_LEFT);

            $p = Product::firstOrCreate(
                ['sku' => $sku],
                [
                    'category_id' => $cat->id,
                    'name' => 'Demo Product ' . $i,
                    'description' => 'Demo marketplace product generated by seeder.',
                    'stock_quantity' => 50 + ($i * 3),
                    'brand' => 'Livemo',
                    'manufacturer' => 'Livemo Supplies',
                    'specifications' => ['version' => (string) $i],
                    'requires_prescription' => false,
                ]
            );

            $l = Listing::firstOrCreate(
                ['listable_type' => Product::class, 'listable_id' => $p->id, 'seller_id' => $user->id],
                [
                    'title' => $p->name,
                    'description' => $p->description,
                    'price' => 5 + ($i * 2),
                    'currency' => 'USD',
                    'status' => 'active',
                    'featured' => $i <= 6,
                    'location' => 'Kigali, Rwanda',
                    'delivery_available' => true,
                    'delivery_fee' => 1.00,
                    'max_delivery_distance_km' => 25,
                    'tags' => ['demo', $cat->slug],
                    'published_at' => now(),
                    'expires_at' => now()->addDays(30),
                ]
            );

            ListingImage::firstOrCreate(
                ['listing_id' => $l->id, 'path' => $productImageUrls[($i - 3) % count($productImageUrls)]],
                [
                    'order' => 0,
                    'is_primary' => true,
                    'mime_type' => 'image/jpeg',
                ]
            );
        }

        $order = Order::firstOrCreate(
            ['order_number' => 'LVM-DEMO-0001'],
            [
                'buyer_id' => $buyer->id,
                'seller_id' => $user->id,
                'subtotal' => 35.00,
                'delivery_fee' => 2.00,
                'tax' => 0.00,
                'total' => 37.00,
                'currency' => 'USD',
                'status' => 'paid',
                'payment_method' => 'card',
                'payment_status' => 'completed',
                'payment_intent_id' => 'pi_demo_' . Str::random(10),
                'shipping_address' => ['city' => 'Kigali', 'country' => 'RW', 'address1' => 'KN 1 Rd'],
                'billing_address' => ['city' => 'Kigali', 'country' => 'RW', 'address1' => 'KN 1 Rd'],
                'notes' => 'Demo order for admin dashboard',
                'paid_at' => now()->subDays(2),
            ]
        );

        OrderItem::firstOrCreate(
            ['order_id' => $order->id, 'listing_id' => $listing1->id],
            [
                'quantity' => 1,
                'price' => 35.00,
                'subtotal' => 35.00,
                'listing_snapshot' => [
                    'title' => $listing1->title,
                    'price' => (string) $listing1->price,
                    'currency' => $listing1->currency,
                ],
            ]
        );

        PlatformSetting::updateOrCreate(
            ['key' => 'commission_rate'],
            ['value' => 0.05, 'type' => 'number', 'updated_by' => $admin->id]
        );
        PlatformSetting::updateOrCreate(
            ['key' => 'site_name'],
            ['value' => 'Livemo', 'type' => 'string', 'updated_by' => $admin->id]
        );
        PlatformSetting::updateOrCreate(
            ['key' => 'maintenance_mode'],
            ['value' => false, 'type' => 'boolean', 'updated_by' => $admin->id]
        );

        Payout::firstOrCreate(
            ['seller_id' => $user->id, 'requested_by_admin_id' => $admin->id, 'amount' => 50.00, 'currency' => 'USD'],
            ['status' => 'requested', 'notes' => 'Demo payout request']
        );

        Announcement::firstOrCreate(
            ['title' => 'Welcome to Livemo Admin'],
            [
                'body' => 'This is a demo announcement to validate admin CMS features.',
                'level' => 'info',
                'is_active' => true,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addDays(30),
                'created_by' => $admin->id,
            ]
        );

        ContentPage::firstOrCreate(
            ['slug' => 'how-it-works'],
            [
                'title' => 'How it Works',
                'body' => 'Demo content page. Replace with real content.',
                'is_published' => true,
                'published_at' => now()->subDays(3),
                'updated_by' => $admin->id,
            ]
        );

        FooterContent::firstOrCreate(
            ['key' => 'company'],
            [
                'title' => 'Company',
                'content' => [
                    ['label' => 'About', 'href' => '/about'],
                    ['label' => 'Help', 'href' => '/help'],
                ],
                'order' => 1,
                'is_active' => true,
                'updated_by' => $admin->id,
            ]
        );

        ListingReport::firstOrCreate(
            ['listing_id' => $listing2->id, 'reporter_id' => $buyer->id, 'reason' => 'Suspicious listing'],
            [
                'details' => 'Demo report for admin moderation queue.',
                'status' => 'open',
                'assigned_admin_id' => $admin->id,
            ]
        );

        Dispute::firstOrCreate(
            ['order_id' => $order->id, 'opened_by_user_id' => $buyer->id],
            [
                'against_user_id' => $user->id,
                'subject' => 'Order issue',
                'description' => 'Demo dispute for admin review.',
                'status' => 'open',
                'assigned_admin_id' => $admin->id,
            ]
        );

        RefundRequest::firstOrCreate(
            ['order_id' => $order->id, 'requested_by_user_id' => $buyer->id],
            [
                'amount' => 10.00,
                'currency' => 'USD',
                'reason' => 'Item not as described',
                'details' => 'Demo refund request.',
                'status' => 'requested',
            ]
        );

        EscrowTransaction::firstOrCreate(
            ['order_id' => $order->id, 'seller_id' => $user->id, 'type' => 'hold'],
            [
                'amount' => 37.00,
                'currency' => 'USD',
                'status' => 'completed',
                'notes' => 'Demo escrow hold on paid order',
                'processed_by_admin_id' => $admin->id,
            ]
        );

        $this->command->info('Demo data seeded successfully!');
    }
}

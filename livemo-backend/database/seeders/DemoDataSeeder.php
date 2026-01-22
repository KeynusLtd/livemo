<?php

namespace Database\Seeders;

use App\Models\Farm;
use App\Models\Animal;
use App\Models\Sensor;
use App\Models\User;
use App\Models\Marketplace\Category;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\Order;
use App\Models\Marketplace\OrderItem;
use App\Models\Marketplace\Product;
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

        // Create demo user
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
                'status' => 'pending_review',
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

        $this->command->info('Demo data seeded successfully!');
    }
}

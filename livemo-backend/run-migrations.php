<?php

/**
 * Migration Runner Script
 * 
 * This script runs all marketplace migrations in the correct order.
 * Run with: php run-migrations.php
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Schema\Blueprint;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Setup database connection
$capsule = new Capsule;

$capsule->addConnection([
    'driver' => 'pgsql',
    'host' => $_ENV['DB_HOST'],
    'port' => $_ENV['DB_PORT'],
    'database' => $_ENV['DB_DATABASE'],
    'username' => $_ENV['DB_USERNAME'],
    'password' => $_ENV['DB_PASSWORD'],
    'charset' => 'utf8',
    'prefix' => '',
    'schema' => 'public',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

$schema = Capsule::schema();

echo "🚀 Starting Livemo Marketplace Migrations...\n\n";

// Migration files in correct order
$migrations = [
    '2024_01_12_000001_create_categories_table.php',
    '2024_01_12_000002_add_marketplace_fields_to_users_table.php',
    '2024_01_12_000003_add_marketplace_fields_to_animals_table.php',
    '2024_01_12_000004_create_seller_profiles_table.php',
    '2024_01_12_000005_create_products_table.php',
    '2024_01_12_000006_create_services_table.php',
    '2024_01_12_000007_create_listings_table.php',
    '2024_01_12_000008_create_listing_images_table.php',
    '2024_01_12_000009_create_cart_items_table.php',
    '2024_01_12_000010_create_orders_table.php',
    '2024_01_12_000011_create_order_items_table.php',
    '2024_01_12_000012_create_reviews_table.php',
    '2024_01_12_000013_create_review_responses_table.php',
    '2024_01_12_000014_create_conversations_table.php',
    '2024_01_12_000015_create_conversation_participants_table.php',
    '2024_01_12_000016_create_messages_table.php',
    '2024_01_12_000017_create_saved_listings_table.php',
];

$migrated = 0;
$failed = 0;

foreach ($migrations as $migration) {
    $path = __DIR__ . '/database/migrations/' . $migration;
    
    if (!file_exists($path)) {
        echo "❌ Migration file not found: $migration\n";
        $failed++;
        continue;
    }
    
    try {
        echo "⏳ Running: $migration ... ";
        
        // Include and run the migration
        $migrationClass = include $path;
        $migrationClass->up();
        
        echo "✅ Success\n";
        $migrated++;
        
    } catch (Exception $e) {
        echo "❌ Failed\n";
        echo "   Error: " . $e->getMessage() . "\n";
        $failed++;
    }
}

echo "\n";
echo "========================================\n";
echo "Migration Summary:\n";
echo "✅ Successful: $migrated\n";
echo "❌ Failed: $failed\n";
echo "========================================\n";

if ($failed === 0) {
    echo "\n🎉 All migrations completed successfully!\n";
} else {
    echo "\n⚠️  Some migrations failed. Please check the errors above.\n";
}

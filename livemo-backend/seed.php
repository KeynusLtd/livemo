<?php
/**
 * Database Seeder
 * Creates demo data for independent testing
 */

// Database configuration
$dbConfig = [
    'host' => '127.0.0.1',
    'port' => '5432',
    'database' => 'livemo',
    'username' => 'livemo_user',
    'password' => 'livemo123',
];

try {
    $dsn = "pgsql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']}";
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Connected to database. Starting seed...\n\n";

    // 1. Create a Test User (Seller)
    $passwordHash = password_hash('password', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW()) RETURNING id");
    $stmt->execute(['John Doe', 'john@example.com', $passwordHash, 'seller', true]);
    $userId = $stmt->fetchColumn();
    echo "👤 Created User: John Doe (ID: $userId)\n";

    // 2. Create Seller Profile
    $stmt = $pdo->prepare("INSERT INTO seller_profiles (user_id, business_name, description, verification_status, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute([$userId, 'Green Valley Farm', 'Premium livestock provider', 'verified', true]);
    echo "🏢 Created Seller Profile\n";

    // 3. Create a Farm
    $stmt = $pdo->prepare("INSERT INTO farms (user_id, name, location, country, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW()) RETURNING id");
    $stmt->execute([$userId, 'Green Valley Main Farm', 'Kigali, Rwanda', 'RW', true]);
    $farmId = $stmt->fetchColumn();
    echo "🚜 Created Farm (ID: $farmId)\n";

    // 4. Create an Animal
    $stmt = $pdo->prepare("INSERT INTO animals (farm_id, tag_number, species, breed, gender, status, is_for_sale, marketplace_status, marketplace_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) RETURNING id");
    $stmt->execute([$farmId, 'COW-001', 'Cattle', 'Holstein', 'Female', 'healthy', true, 'active', 1500.00]);
    $animalId = $stmt->fetchColumn();
    echo "🐄 Created Animal: COW-001 (ID: $animalId)\n";

    // 5. Create a Listing for the Animal
    $stmt = $pdo->prepare("INSERT INTO listings (listable_type, listable_id, seller_id, title, description, price, currency, status, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW()) RETURNING id");
    // Note: Laravel polymorphic types usually use the full class name
    $stmt->execute(['App\\Models\\Animal', $animalId, $userId, 'Premium Holstein Cow', 'High producing milk cow, 3 years old.', 1500.00, 'USD', 'active']);
    $listingId = $stmt->fetchColumn();
    echo "🏷️  Created Listing: Premium Holstein Cow (ID: $listingId)\n";

    echo "\n✨ Seeding completed successfully!\n";

} catch (PDOException $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}

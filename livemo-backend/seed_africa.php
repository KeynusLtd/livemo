<?php
/**
 * African Marketplace Seeder (Final Fix)
 * Populates database with East African context data
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

    echo "✅ Connected to database. Starting African data seed...\n\n";

    // --- Helper Functions ---
    function createUser($pdo, $name, $email, $role = 'seller') {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, true, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id");
        $stmt->execute([$name, $email, password_hash('password', PASSWORD_BCRYPT), $role]);
        return $stmt->fetchColumn();
    }

    function createSellerProfile($pdo, $userId, $bizName, $desc, $location) {
        $stmt = $pdo->prepare("INSERT INTO seller_profiles (user_id, business_name, description, verification_status, is_active, created_at, updated_at) VALUES (?, ?, ?, 'verified', true, NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING");
        $stmt->execute([$userId, $bizName, $desc]);
        
        $stmt = $pdo->prepare("INSERT INTO farms (user_id, name, location, country, is_active, created_at, updated_at) VALUES (?, ?, ?, 'RW', true, NOW(), NOW()) RETURNING id");
        $stmt->execute([$userId, $bizName . ' Farm', $location]);
        return $stmt->fetchColumn();
    }

    function createCategory($pdo, $name, $slug, $type = 'product') {
        $stmt = $pdo->prepare("INSERT INTO categories (name, slug, type, is_active, created_at, updated_at) VALUES (?, ?, ?, true, NOW(), NOW()) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id");
        $stmt->execute([$name, $slug, $type]);
        return $stmt->fetchColumn();
    }

    function createListing($pdo, $sellerId, $listableType, $listableId, $title, $desc, $price, $location, $currency, $imageUrl) {
        $stmt = $pdo->prepare("INSERT INTO listings (listable_type, listable_id, seller_id, title, description, price, currency, status, location, featured, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, NOW(), NOW(), NOW()) RETURNING id");
        $stmt->execute([$listableType, $listableId, $sellerId, $title, $desc, $price, $currency, $location, rand(0, 1) ? 'true' : 'false']);
        $listingId = $stmt->fetchColumn();

        $stmt = $pdo->prepare("INSERT INTO listing_images (listing_id, path, is_primary, \"order\", created_at, updated_at) VALUES (?, ?, true, 1, NOW(), NOW())");
        $stmt->execute([$listingId, $imageUrl]);
        return $listingId;
    }

    // --- 0. Categories ---
    $catLivestock = createCategory($pdo, 'Livestock', 'livestock', 'product');
    $catFeed = createCategory($pdo, 'Feeds & Nutrition', 'feeds', 'product');
    $catVet = createCategory($pdo, 'Veterinary Services', 'vet-services', 'service');
    echo "📂 Created Categories\n";

    // --- 1. Sellers ---
    $u1 = createUser($pdo, 'Jean Pierre', 'jp@amanzi.rw');
    $f1 = createSellerProfile($pdo, $u1, 'Amanzi Farms', 'Premium Ankole breeders in Eastern Province', 'Kayonza, Rwanda');
    
    $u2 = createUser($pdo, 'Mary Wanjiku', 'mary@savanna.ke');
    $f2 = createSellerProfile($pdo, $u2, 'Savanna Livestock', 'Organic goat and sheep farm', 'Narok, Kenya');
    
    $u3 = createUser($pdo, 'Juma Ali', 'juma@kilimo.tz');
    $f3 = createSellerProfile($pdo, $u3, 'Kilimo Smart Inputs', 'Quality animal feeds and supplements', 'Arusha, Tanzania');
    echo "👤 Created Sellers (Rwanda, Kenya, Tanzania)\n";


    // --- 2. Listings (Livestock) ---

    // Ankole Bull
    $stmt = $pdo->prepare("INSERT INTO animals (farm_id, tag_number, species, breed, gender, status, is_for_sale, marketplace_status, marketplace_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', true, 'active', ?, NOW(), NOW()) RETURNING id");
    $stmt->execute([$f1, 'ANK-001', 'Cattle', 'Ankole Longhorn', 'Male', 2500000]);
    $a1 = $stmt->fetchColumn();
    createListing($pdo, $u1, 'App\\Models\\Animal', $a1, 'Purebred Ankole Longhorn Bull', 'Magnificent 4-year-old Ankole bull with massive horn span. Pure genetics from Nyagatare.', 2500000, 'Kayonza, Rwanda', 'RWF', 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Ankole-Watusi_cattle.jpg');

    // Friesian Heifer
    $stmt = $pdo->prepare("INSERT INTO animals (farm_id, tag_number, species, breed, gender, status, is_for_sale, marketplace_status, marketplace_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', true, 'active', ?, NOW(), NOW()) RETURNING id");
    $stmt->execute([$f1, 'FR-202', 'Cattle', 'Friesian', 'Female', 1200000]);
    $a2 = $stmt->fetchColumn();
    createListing($pdo, $u1, 'App\\Models\\Animal', $a2, 'High Yield Friesian Heifer', 'Pregnant Friesian heifer, expecting first calf. Mother produces 25L/day.', 1200000, 'Rwamagana, Rwanda', 'RWF', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Cow_female_black_white.jpg/640px-Cow_female_black_white.jpg');

    // Boer Goats
    $stmt = $pdo->prepare("INSERT INTO animals (farm_id, tag_number, species, breed, gender, status, is_for_sale, marketplace_status, marketplace_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', true, 'active', ?, NOW(), NOW()) RETURNING id");
    $stmt->execute([$f2, 'BG-101', 'Goat', 'Boer', 'Male', 30000]);
    $a3 = $stmt->fetchColumn();
    createListing($pdo, $u2, 'App\\Models\\Animal', $a3, 'Champion Boer Goat Buck', 'Fast growing meat goat buck. 80kg weight.', 30000, 'Narok, Kenya', 'KES', 'https://upload.wikimedia.org/wikipedia/commons/3/30/Boer_Goat_Buck.jpg');

    // Dorper Sheep
    $stmt = $pdo->prepare("INSERT INTO animals (farm_id, tag_number, species, breed, gender, status, is_for_sale, marketplace_status, marketplace_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', true, 'active', ?, NOW(), NOW()) RETURNING id");
    $stmt->execute([$f2, 'DS-055', 'Sheep', 'Dorper', 'Female', 15000]);
    $a4 = $stmt->fetchColumn();
    createListing($pdo, $u2, 'App\\Models\\Animal', $a4, 'Dorper Ewes (Flock of 5)', 'Hardy dorper ewes suitable for arid areas. Price per head.', 15000, 'Kajiado, Kenya', 'KES', 'https://upload.wikimedia.org/wikipedia/commons/2/29/Dorper_sheep.jpg');


    // --- 3. Listings (Products) ---

    // Napier Grass
    $stmt = $pdo->prepare("INSERT INTO products (name, sku, category_id, stock_quantity, created_at, updated_at) VALUES (?, ?, ?, 1000, NOW(), NOW()) RETURNING id");
    $stmt->execute(['Napier Grass Cuttings', 'GRASS-01', $catFeed]);
    $p1 = $stmt->fetchColumn();
    createListing($pdo, $u3, 'App\\Models\\Marketplace\\Product', $p1, 'Hybrid Napier Grass Cuttings', 'High protein fodder grass. Fast regrowth and drought tolerant. 40kg bag.', 5000, 'Arusha, Tanzania', 'TZS', 'https://live.staticflickr.com/65535/51234567890_abcdef1234_z.jpg');

    echo "✨ 5 African listings created successfully!\n";

} catch (PDOException $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "\nStack Trace:\n" . $e->getTraceAsString() . "\n";
}

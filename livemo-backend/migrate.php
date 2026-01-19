<?php
/**
 * Comprehensive Migration Runner
 * Runs all migrations including base tables using PDO
 */

// Database configuration from .env
$dbConfig = [
    'host' => '127.0.0.1',
    'port' => '5432',
    'database' => 'livemo',
    'username' => 'livemo_user',
    'password' => 'livemo123',
];

try {
    // Connect to PostgreSQL
    $dsn = "pgsql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']}";
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connected to PostgreSQL database: {$dbConfig['database']}\n\n";
    echo "🚀 Starting migrations...\n\n";

    // --- Base Laravel Tables ---
    
    echo "⏳ Creating users table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id BIGSERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            email_verified_at TIMESTAMP NULL,
            password VARCHAR(255) NOT NULL,
            remember_token VARCHAR(100) NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
    ");
    echo "✅\n";

    echo "⏳ Creating password_reset_tokens table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            email VARCHAR(255) PRIMARY KEY,
            token VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NULL
        );
    ");
    echo "✅\n";

    echo "⏳ Creating sessions table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sessions (
            id VARCHAR(255) PRIMARY KEY,
            user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
            ip_address VARCHAR(45) NULL,
            user_agent TEXT NULL,
            payload TEXT NOT NULL,
            last_activity INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);
    ");
    echo "✅\n";

    // --- Existing Domain Tables (Farms, Animals) ---
    // We strictly need these for foreign keys in marketplace tables

    echo "⏳ Creating farms table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS farms (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            description TEXT NULL,
            location VARCHAR(255) NOT NULL,
            size DECIMAL(10, 2) NULL,
            latitude DECIMAL(10, 8) NULL,
            longitude DECIMAL(11, 8) NULL,
            contact_phone VARCHAR(255) NULL,
            contact_email VARCHAR(255) NULL,
            address VARCHAR(255) NULL,
            city VARCHAR(255) NULL,
            country VARCHAR(255) DEFAULT 'RW',
            settings JSONB NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            deleted_at TIMESTAMP NULL
        );
    ");
    echo "✅\n";

    echo "⏳ Creating animals table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS animals (
            id BIGSERIAL PRIMARY KEY,
            farm_id BIGINT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
            tag_number VARCHAR(255) NOT NULL,
            name VARCHAR(255) NULL,
            species VARCHAR(255) NOT NULL,
            breed VARCHAR(255) NULL,
            gender VARCHAR(50) NOT NULL,
            birth_date DATE NULL,
            acquisition_date DATE NULL,
            weight DECIMAL(10, 2) NULL,
            status VARCHAR(50) DEFAULT 'active',
            notes TEXT NULL,
            image VARCHAR(255) NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            deleted_at TIMESTAMP NULL
        );
    ");
    echo "✅\n";

    // --- Marketplace Tables ---
    
    // Migration 1: Categories
    echo "⏳ Creating categories table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS categories (
            id BIGSERIAL PRIMARY KEY,
            parent_id BIGINT NULL REFERENCES categories(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            description TEXT NULL,
            icon VARCHAR(255) NULL,
            type VARCHAR(50) DEFAULT 'product' CHECK (type IN ('product', 'service')),
            \"order\" INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_categories_type_active ON categories(type, is_active);
        CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    ");
    echo "✅\n";
    
    // Migration 2: Add marketplace fields to users
    echo "⏳ Adding marketplace fields to users table... ";
    // Check if column exists first to be idempotent
    $pdo->exec("
        DO $$ 
        BEGIN 
            BEGIN
                ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'both', 'admin'));
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column role already exists in users';
            END;
            BEGIN
                ALTER TABLE users ADD COLUMN phone VARCHAR(255) NULL;
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column phone already exists in users';
            END;
            BEGIN
                ALTER TABLE users ADD COLUMN address JSONB NULL;
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column address already exists in users';
            END;
            BEGIN
                ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL;
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column avatar already exists in users';
            END;
            BEGIN
                ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column is_verified already exists in users';
            END;
             BEGIN
                ALTER TABLE users ADD COLUMN verified_at TIMESTAMP NULL;
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column verified_at already exists in users';
            END;
        END $$;
    ");
    echo "✅\n";
    
    // Migration 3: Add marketplace fields to animals
    echo "⏳ Adding marketplace fields to animals table... ";
    $pdo->exec("
        DO $$ 
        BEGIN 
            BEGIN
                ALTER TABLE animals ADD COLUMN is_for_sale BOOLEAN DEFAULT FALSE;
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column is_for_sale already exists in animals';
            END;
            BEGIN
                ALTER TABLE animals ADD COLUMN marketplace_price DECIMAL(10,2) NULL;
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column marketplace_price already exists in animals';
            END;
            BEGIN
                ALTER TABLE animals ADD COLUMN marketplace_status VARCHAR(50) DEFAULT 'draft' CHECK (marketplace_status IN ('draft', 'active', 'sold', 'inactive'));
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column marketplace_status already exists in animals';
            END;
            BEGIN
                ALTER TABLE animals ADD COLUMN marketplace_description TEXT NULL;
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column marketplace_description already exists in animals';
            END;
        END $$;
        CREATE INDEX IF NOT EXISTS idx_animals_marketplace ON animals(is_for_sale, marketplace_status);
    ");
    echo "✅\n";
    
    // Migration 4: Seller Profiles
    echo "⏳ Creating seller_profiles table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS seller_profiles (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            business_name VARCHAR(255) NOT NULL,
            description TEXT NULL,
            logo VARCHAR(255) NULL,
            verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
            verification_documents JSONB NULL,
            verified_at TIMESTAMP NULL,
            rating_average DECIMAL(3,2) DEFAULT 0,
            rating_count INTEGER DEFAULT 0,
            total_sales INTEGER DEFAULT 0,
            response_time_hours DECIMAL(5,2) NULL,
            bank_account_encrypted TEXT NULL,
            tax_id VARCHAR(255) NULL,
            business_hours JSONB NULL,
            website VARCHAR(255) NULL,
            social_links JSONB NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_seller_profiles_verification ON seller_profiles(verification_status, is_active);
        CREATE INDEX IF NOT EXISTS idx_seller_profiles_rating ON seller_profiles(rating_average);
    ");
    echo "✅\n";
    
    // Migration 5: Products
    echo "⏳ Creating products table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS products (
            id BIGSERIAL PRIMARY KEY,
            category_id BIGINT NULL REFERENCES categories(id) ON DELETE SET NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT NULL,
            sku VARCHAR(255) UNIQUE NOT NULL,
            stock_quantity INTEGER DEFAULT 0,
            weight DECIMAL(10,2) NULL,
            dimensions JSONB NULL,
            brand VARCHAR(255) NULL,
            manufacturer VARCHAR(255) NULL,
            specifications JSONB NULL,
            requires_prescription BOOLEAN DEFAULT FALSE,
            expiry_date DATE NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            deleted_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
        CREATE INDEX IF NOT EXISTS idx_products_category_stock ON products(category_id, stock_quantity);
    ");
    echo "✅\n";
    
    // Migration 6: Services
    echo "⏳ Creating services table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS services (
            id BIGSERIAL PRIMARY KEY,
            category_id BIGINT NULL REFERENCES categories(id) ON DELETE SET NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT NULL,
            service_type VARCHAR(50) DEFAULT 'other' CHECK (service_type IN ('veterinary', 'transport', 'consulting', 'training', 'breeding', 'other')),
            duration_minutes INTEGER NULL,
            availability_schedule JSONB NULL,
            location_based BOOLEAN DEFAULT TRUE,
            max_distance_km INTEGER NULL,
            requirements JSONB NULL,
            requires_booking BOOLEAN DEFAULT TRUE,
            advance_booking_hours INTEGER DEFAULT 24,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            deleted_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_services_type ON services(service_type, location_based);
    ");
    echo "✅\n";
    
    // Migration 7: Listings
    echo "⏳ Creating listings table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS listings (
            id BIGSERIAL PRIMARY KEY,
            listable_type VARCHAR(255) NOT NULL,
            listable_id BIGINT NOT NULL,
            seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT NULL,
            price DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'USD',
            status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold', 'inactive', 'pending_review')),
            featured BOOLEAN DEFAULT FALSE,
            views_count INTEGER DEFAULT 0,
            location VARCHAR(255) NULL,
            latitude DECIMAL(10,8) NULL,
            longitude DECIMAL(11,8) NULL,
            delivery_available BOOLEAN DEFAULT FALSE,
            delivery_fee DECIMAL(10,2) NULL,
            max_delivery_distance_km INTEGER NULL,
            tags JSONB NULL,
            published_at TIMESTAMP NULL,
            expires_at TIMESTAMP NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            deleted_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_listings_listable ON listings(listable_type, listable_id);
        CREATE INDEX IF NOT EXISTS idx_listings_seller_status ON listings(seller_id, status);
        CREATE INDEX IF NOT EXISTS idx_listings_status_published ON listings(status, published_at);
        CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);
    ");
    echo "✅\n";
    
    // Migration 8: Listing Images
    echo "⏳ Creating listing_images table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS listing_images (
            id BIGSERIAL PRIMARY KEY,
            listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
            path VARCHAR(255) NOT NULL,
            thumbnail_path VARCHAR(255) NULL,
            \"order\" INTEGER DEFAULT 0,
            is_primary BOOLEAN DEFAULT FALSE,
            caption VARCHAR(255) NULL,
            size_bytes INTEGER NULL,
            mime_type VARCHAR(255) NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_listing_images_listing_order ON listing_images(listing_id, \"order\");
        CREATE INDEX IF NOT EXISTS idx_listing_images_primary ON listing_images(is_primary);
    ");
    echo "✅\n";
    
    // Migration 9: Cart Items
    echo "⏳ Creating cart_items table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS cart_items (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
            quantity INTEGER DEFAULT 1,
            price_snapshot DECIMAL(10,2) NOT NULL,
            options JSONB NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            UNIQUE(user_id, listing_id)
        );
        CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
    ");
    echo "✅\n";
    
    // Migration 10: Orders
    echo "⏳ Creating orders table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS orders (
            id BIGSERIAL PRIMARY KEY,
            order_number VARCHAR(255) UNIQUE NOT NULL,
            buyer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            subtotal DECIMAL(10,2) NOT NULL,
            delivery_fee DECIMAL(10,2) DEFAULT 0,
            tax DECIMAL(10,2) DEFAULT 0,
            total DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'USD',
            status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
            payment_method VARCHAR(50) NULL CHECK (payment_method IN ('card', 'mobile_money', 'bank_transfer', 'cash')),
            payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
            payment_intent_id VARCHAR(255) NULL,
            shipping_address JSONB NULL,
            billing_address JSONB NULL,
            notes TEXT NULL,
            cancellation_reason TEXT NULL,
            paid_at TIMESTAMP NULL,
            shipped_at TIMESTAMP NULL,
            delivered_at TIMESTAMP NULL,
            cancelled_at TIMESTAMP NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
        CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON orders(buyer_id, status);
        CREATE INDEX IF NOT EXISTS idx_orders_seller_status ON orders(seller_id, status);
        CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
    ");
    echo "✅\n";
    
    // Migration 11: Order Items
    echo "⏳ Creating order_items table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS order_items (
            id BIGSERIAL PRIMARY KEY,
            order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            listing_id BIGINT NULL REFERENCES listings(id) ON DELETE SET NULL,
            quantity INTEGER DEFAULT 1,
            price DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL,
            listing_snapshot JSONB NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    ");
    echo "✅\n";
    
    // Migration 12: Reviews
    echo "⏳ Creating reviews table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS reviews (
            id BIGSERIAL PRIMARY KEY,
            reviewable_type VARCHAR(255) NOT NULL,
            reviewable_id BIGINT NOT NULL,
            reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            order_id BIGINT NULL REFERENCES orders(id) ON DELETE SET NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            title VARCHAR(255) NULL,
            comment TEXT NULL,
            verified_purchase BOOLEAN DEFAULT FALSE,
            helpful_count INTEGER DEFAULT 0,
            is_approved BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_reviews_reviewable ON reviews(reviewable_type, reviewable_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
    ");
    echo "✅\n";
    
    // Migration 13: Review Responses
    echo "⏳ Creating review_responses table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS review_responses (
            id BIGSERIAL PRIMARY KEY,
            review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            response TEXT NOT NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_review_responses_review ON review_responses(review_id);
    ");
    echo "✅\n";
    
    // Migration 14: Conversations
    echo "⏳ Creating conversations table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS conversations (
            id BIGSERIAL PRIMARY KEY,
            listing_id BIGINT NULL REFERENCES listings(id) ON DELETE SET NULL,
            subject VARCHAR(255) NULL,
            last_message_at TIMESTAMP NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at);
    ");
    echo "✅\n";
    
    // Migration 15: Conversation Participants
    echo "⏳ Creating conversation_participants table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS conversation_participants (
            id BIGSERIAL PRIMARY KEY,
            conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            last_read_at TIMESTAMP NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            UNIQUE(conversation_id, user_id)
        );
        CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
    ");
    echo "✅\n";
    
    // Migration 16: Messages
    echo "⏳ Creating messages table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS messages (
            id BIGSERIAL PRIMARY KEY,
            conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            body TEXT NOT NULL,
            attachments JSONB NULL,
            read_at TIMESTAMP NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
        CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
    ");
    echo "✅\n";
    
    // Migration 17: Saved Listings
    echo "⏳ Creating saved_listings table... ";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS saved_listings (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            UNIQUE(user_id, listing_id)
        );
        CREATE INDEX IF NOT EXISTS idx_saved_listings_user ON saved_listings(user_id);
    ");
    echo "✅\n";
    
    echo "\n========================================\n";
    echo "🎉 All migrations completed successfully!\n";
    echo "========================================\n\n";
    
    // Show created tables
    echo "📋 Created tables:\n";
    $result = $pdo->query("
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    ");
    
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "   ✓ " . $row['table_name'] . "\n";
    }
    
} catch (PDOException $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

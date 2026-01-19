<?php
/**
 * Dynamic Data Verification Script
 * Updates the price of the Ankole Bull to demonstrate real-time DB connection
 */

try {
    $pdo = new PDO("pgsql:host=127.0.0.1;port=5432;dbname=livemo", "livemo_user", "livemo123");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Get current price
    $stmt = $pdo->query("SELECT price FROM listings WHERE title LIKE '%Ankole%'");
    $oldPrice = $stmt->fetchColumn();

    // 2. Update price (increase by 300,000)
    $newPrice = 2800000;
    $pdo->exec("UPDATE listings SET price = $newPrice, updated_at = NOW() WHERE title LIKE '%Ankole%'");

    echo "🔄 Dynamic Data Verification:\n";
    echo "---------------------------\n";
    echo "Old Price: " . number_format($oldPrice) . "\n";
    echo "Updated Price: " . number_format($newPrice) . "\n";
    echo "✅ Database updated successfully!\n";
    echo "👉 Now refresh your browser (http://localhost:5173)\n";
    echo "   You should see the Ankole Bull price change instantly.\n";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}

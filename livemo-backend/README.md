# Livemo Backend - Laravel API

A comprehensive livestock management platform backend built with Laravel 12, providing RESTful APIs for IoT sensor integration, health monitoring, and farm management.

## Features

- 🐄 **Livestock Management** - Track cattle, goats, sheep, poultry, swine, horses, and rabbits
- 📊 **Health Monitoring** - Real-time health records and vital signs tracking
- 🔔 **Alert System** - Automated alerts for health issues, sensor status, and critical events
- 📡 **IoT Integration** - Support for wearable sensors and centralized monitoring stations
- 🌾 **Pasture Management** - Track grazing areas and animal assignments
- 💉 **Vaccination Tracking** - Complete medical compliance and vaccination schedules
- 🐣 **Breeding Records** - Pregnancy monitoring and offspring tracking
- 🔐 **Authentication** - Secure API authentication with Laravel Sanctum

## Requirements

- PHP 8.2 or higher
- Composer
- PostgreSQL 13+ (or MySQL 8+)
- Redis (optional, for queues and caching)

## Installation

### 1. Clone and Navigate

```bash
cd /Users/Remy/WORKSPACE/KEYNUS/livemo/livemo-backend/livemo-backend
```

### 2. Install Dependencies

```bash
composer install
```

### 3. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configure Database

Edit `.env` file:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=livemo
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Seed Demo Data (Optional)

```bash
php artisan db:seed --class=DemoDataSeeder
```

This creates:
- Demo user: `demo@livemo.com` / `password`
- Sample farm with 3 animals and sensors

### 7. Start Development Server

```bash
php artisan serve
```

API will be available at `http://localhost:8000/api/v1`

## API Documentation

### Authentication

#### Register
```http
POST /api/v1/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Login
```http
POST /api/v1/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes `access_token` for authenticated requests.

### Farms

```http
GET    /api/v1/farms              # List all farms
POST   /api/v1/farms              # Create farm
GET    /api/v1/farms/{id}         # Get farm details
PUT    /api/v1/farms/{id}         # Update farm
DELETE /api/v1/farms/{id}         # Delete farm
GET    /api/v1/farms/{id}/animals # Get farm animals
GET    /api/v1/farms/{id}/dashboard # Get dashboard stats
```

### Animals

```http
GET    /api/v1/animals                # List animals (with filters)
POST   /api/v1/animals                # Register new animal
GET    /api/v1/animals/{id}           # Get animal details
PUT    /api/v1/animals/{id}           # Update animal
DELETE /api/v1/animals/{id}           # Delete animal
GET    /api/v1/animals/{id}/health    # Get health history
GET    /api/v1/animals/{id}/timeline  # Get activity timeline
```

Query parameters for filtering:
- `farm_id` - Filter by farm
- `type` - Filter by animal type (cattle, goats, etc.)
- `status` - Filter by status (healthy, sick, etc.)
- `search` - Search by tag_id or name

### Health Records

```http
GET    /api/v1/health-records          # List health records
POST   /api/v1/health-records          # Create health record
GET    /api/v1/health-records/{id}     # Get health record
PUT    /api/v1/health-records/{id}     # Update health record
GET    /api/v1/health/analytics        # Get health analytics
```

### Sensors

```http
GET    /api/v1/sensors              # List sensors
POST   /api/v1/sensors              # Register sensor
GET    /api/v1/sensors/{id}         # Get sensor details
PUT    /api/v1/sensors/{id}         # Update sensor
POST   /api/v1/sensors/{id}/data    # Submit sensor data (IoT endpoint)
```

### Alerts

```http
GET    /api/v1/alerts                    # List alerts
GET    /api/v1/alerts/{id}               # Get alert details
PUT    /api/v1/alerts/{id}/acknowledge   # Acknowledge alert
PUT    /api/v1/alerts/{id}/resolve       # Resolve alert
GET    /api/v1/alerts/stats              # Get alert statistics
```

## Database Schema

### Core Tables

- `users` - User accounts
- `farms` - Farm/ranch information
- `animals` - Livestock records
- `sensors` - IoT devices
- `health_records` - Health monitoring data
- `alerts` - Notification system
- `feed_schedules` - Feeding management
- `pastures` - Grazing areas
- `breeding_records` - Reproduction tracking
- `vaccinations` - Medical compliance
- `monitoring_stations` - Centralized vision-based monitoring

## Livestock Types Supported

- **Cattle** (🐄) - Ankole, Friesian, Jersey, Sahiwal, Boran, Zebu
- **Goats** (🐐) - Boer, Saanen, Toggenburg, Alpine
- **Sheep** (🐑) - Merino, Dorper
- **Poultry** (🐔) - Layers, Broilers, Kuroiler
- **Swine** (🐷) - Large White, Landrace, Duroc
- **Horses** (🐴) - Arabian, Thoroughbred
- **Rabbits** (🐰) - New Zealand White, Californian, Flemish Giant

## Configuration

Livestock types, breeds, and health thresholds are configured in `config/livemo.php`.

## Testing

```bash
php artisan test
```

## License

Proprietary - KEYNUS

## Support

For support, contact: support@keynus.rw

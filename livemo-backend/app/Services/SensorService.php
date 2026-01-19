<?php

namespace App\Services;

use App\Models\Sensor;
use App\Models\HealthRecord;
use App\Models\Alert;
use App\Events\SensorDataReceived;

class SensorService
{
    /**
     * Process incoming sensor data.
     */
    public function processSensorData(Sensor $sensor, array $data): void
    {
        // Update sensor communication timestamp
        $sensor->updateCommunication();

        // Update battery level if provided
        if (isset($data['battery_level'])) {
            $sensor->update(['battery_level' => $data['battery_level']]);

            // Create low battery alert if needed
            if ($sensor->isBatteryLow()) {
                $this->createBatteryAlert($sensor);
            }
        }

        // If sensor is assigned to an animal, create health record
        if ($sensor->animal_id && isset($data['temperature'])) {
            $this->createHealthRecord($sensor, $data);
        }

        // Fire event for real-time processing
        event(new SensorDataReceived($sensor, $data));
    }

    /**
     * Create health record from sensor data.
     */
    protected function createHealthRecord(Sensor $sensor, array $data): void
    {
        $healthData = [
            'animal_id' => $sensor->animal_id,
            'record_type' => 'observation',
            'temperature' => $data['temperature'] ?? null,
            'heart_rate' => $data['heart_rate'] ?? null,
            'activity_level' => $data['activity_level'] ?? null,
            'severity' => 'normal',
        ];

        // Determine severity based on temperature
        if (isset($data['temperature'])) {
            if ($data['temperature'] > 40.0) {
                $healthData['severity'] = 'critical';
                $this->createHealthAlert($sensor, 'High temperature detected');
            } elseif ($data['temperature'] > 39.5 || $data['temperature'] < 38.0) {
                $healthData['severity'] = 'moderate';
            }
        }

        HealthRecord::create($healthData);
    }

    /**
     * Create battery low alert.
     */
    protected function createBatteryAlert(Sensor $sensor): void
    {
        Alert::firstOrCreate(
            [
                'sensor_id' => $sensor->id,
                'type' => 'battery_low',
                'status' => 'pending',
            ],
            [
                'farm_id' => $sensor->farm_id,
                'animal_id' => $sensor->animal_id,
                'severity' => 'warning',
                'title' => 'Low Battery Alert',
                'message' => "Sensor {$sensor->device_id} battery is low ({$sensor->battery_level}%)",
            ]
        );
    }

    /**
     * Create health alert.
     */
    protected function createHealthAlert(Sensor $sensor, string $message): void
    {
        Alert::create([
            'farm_id' => $sensor->farm_id,
            'animal_id' => $sensor->animal_id,
            'sensor_id' => $sensor->id,
            'type' => 'health_critical',
            'severity' => 'critical',
            'title' => 'Health Alert',
            'message' => $message,
        ]);
    }
}

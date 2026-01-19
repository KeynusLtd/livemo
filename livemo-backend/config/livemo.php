<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Livestock Types and Breeds
    |--------------------------------------------------------------------------
    */
    'livestock_types' => [
        'cattle' => [
            'name' => 'Cattle',
            'icon' => '🐄',
            'gestation_days' => 283,
            'normal_temp_min' => 38.0,
            'normal_temp_max' => 39.3,
            'breeds' => [
                'Ankole', 'Friesian', 'Jersey', 'Sahiwal', 'Boran', 'Zebu',
            ],
        ],
        'goats' => [
            'name' => 'Goats',
            'icon' => '🐐',
            'gestation_days' => 150,
            'normal_temp_min' => 38.5,
            'normal_temp_max' => 40.0,
            'breeds' => [
                'Boer', 'Saanen', 'Toggenburg', 'Alpine', 'Local',
            ],
        ],
        'sheep' => [
            'name' => 'Sheep',
            'icon' => '🐑',
            'gestation_days' => 147,
            'normal_temp_min' => 38.5,
            'normal_temp_max' => 40.0,
            'breeds' => [
                'Merino', 'Dorper', 'Local',
            ],
        ],
        'poultry' => [
            'name' => 'Poultry',
            'icon' => '🐔',
            'gestation_days' => 21,
            'normal_temp_min' => 40.5,
            'normal_temp_max' => 41.5,
            'breeds' => [
                'Layers', 'Broilers', 'Kuroiler', 'Local',
            ],
        ],
        'swine' => [
            'name' => 'Swine',
            'icon' => '🐷',
            'gestation_days' => 114,
            'normal_temp_min' => 38.0,
            'normal_temp_max' => 39.5,
            'breeds' => [
                'Large White', 'Landrace', 'Duroc', 'Local',
            ],
        ],
        'horses' => [
            'name' => 'Horses',
            'icon' => '🐴',
            'gestation_days' => 340,
            'normal_temp_min' => 37.5,
            'normal_temp_max' => 38.5,
            'breeds' => [
                'Arabian', 'Thoroughbred', 'Local',
            ],
        ],
        'rabbits' => [
            'name' => 'Rabbits',
            'icon' => '🐰',
            'gestation_days' => 31,
            'normal_temp_min' => 38.5,
            'normal_temp_max' => 40.0,
            'breeds' => [
                'New Zealand White', 'Californian', 'Flemish Giant', 'Local',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Health Thresholds
    |--------------------------------------------------------------------------
    */
    'health_thresholds' => [
        'critical_temperature' => 40.0,
        'low_health_score' => 70,
        'battery_low_threshold' => 20,
        'sensor_offline_minutes' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Alert Configuration
    |--------------------------------------------------------------------------
    */
    'alerts' => [
        'notification_channels' => ['database', 'mail', 'sms'],
        'critical_severity_channels' => ['database', 'mail', 'sms', 'push'],
    ],
];

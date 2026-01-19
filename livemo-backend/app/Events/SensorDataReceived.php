<?php

namespace App\Events;

use App\Models\Sensor;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SensorDataReceived
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Sensor $sensor,
        public array $data
    ) {}
}

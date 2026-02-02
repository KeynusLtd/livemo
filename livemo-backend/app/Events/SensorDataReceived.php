<?php

namespace App\Events;

use App\Models\Sensor;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SensorDataReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Sensor $sensor,
        public array $data
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('farm.' . $this->sensor->farm_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'sensor.data.received';
    }
}

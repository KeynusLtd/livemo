<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\FeedSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedScheduleController extends Controller
{
    protected function assertFarmOwner(Request $request, Farm $farm): void
    {
        if ($farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    protected function assertScheduleInFarm(Farm $farm, FeedSchedule $feedSchedule): void
    {
        if ((int) $feedSchedule->farm_id !== (int) $farm->id) {
            abort(404);
        }
    }

    public function index(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $query = $farm->feedSchedules()->with(['animal', 'completedBy']);

        if ($request->has('is_completed')) {
            $query->where('is_completed', filter_var($request->get('is_completed'), FILTER_VALIDATE_BOOL));
        }

        if ($request->has('animal_id')) {
            $query->where('animal_id', $request->get('animal_id'));
        }

        $schedules = $query->orderBy('scheduled_time')->paginate(20);

        return response()->json($schedules);
    }

    public function store(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'animal_id' => 'nullable|exists:animals,id',
            'group_name' => 'nullable|string|max:255',
            'feed_type' => 'required|string|max:255',
            'quantity' => 'required|numeric|min:0',
            'scheduled_time' => 'required|date_format:H:i',
            'days_of_week' => 'nullable|array',
            'days_of_week.*' => 'integer|min:1|max:7',
            'is_recurring' => 'sometimes|boolean',
            'nutritional_info' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $schedule = FeedSchedule::create([
            ...$validated,
            'farm_id' => $farm->id,
        ]);

        return response()->json([
            'message' => 'Feed schedule created successfully',
            'feed_schedule' => $schedule->load(['animal', 'completedBy']),
        ], 201);
    }

    public function show(Request $request, Farm $farm, FeedSchedule $feedSchedule): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertScheduleInFarm($farm, $feedSchedule);

        return response()->json($feedSchedule->load(['animal', 'completedBy']));
    }

    public function update(Request $request, Farm $farm, FeedSchedule $feedSchedule): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertScheduleInFarm($farm, $feedSchedule);

        $validated = $request->validate([
            'animal_id' => 'nullable|exists:animals,id',
            'group_name' => 'nullable|string|max:255',
            'feed_type' => 'sometimes|string|max:255',
            'quantity' => 'nullable|numeric|min:0',
            'scheduled_time' => 'nullable|date_format:H:i',
            'days_of_week' => 'nullable|array',
            'days_of_week.*' => 'integer|min:1|max:7',
            'is_recurring' => 'sometimes|boolean',
            'nutritional_info' => 'nullable|array',
            'notes' => 'nullable|string',
            'is_completed' => 'sometimes|boolean',
        ]);

        $feedSchedule->update($validated);

        return response()->json([
            'message' => 'Feed schedule updated successfully',
            'feed_schedule' => $feedSchedule->load(['animal', 'completedBy']),
        ]);
    }

    public function complete(Request $request, Farm $farm, FeedSchedule $feedSchedule): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertScheduleInFarm($farm, $feedSchedule);

        $feedSchedule->markCompleted($request->user()->id);

        return response()->json([
            'message' => 'Feeding marked as completed',
            'feed_schedule' => $feedSchedule->load(['animal', 'completedBy']),
        ]);
    }

    public function destroy(Request $request, Farm $farm, FeedSchedule $feedSchedule): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertScheduleInFarm($farm, $feedSchedule);

        $feedSchedule->delete();

        return response()->json([
            'message' => 'Feed schedule deleted successfully',
        ]);
    }
}

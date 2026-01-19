<?php

namespace App\Http\Controllers\Api\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Conversation;
use App\Models\Marketplace\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Display user's conversations.
     */
    public function index(): JsonResponse
    {
        $conversations = Conversation::with(['listing', 'participants', 'messages' => function ($query) {
            $query->latest()->limit(1);
        }])
        ->forUser(auth()->id())
        ->orderBy('last_message_at', 'desc')
        ->get();

        // Add unread count for each conversation
        $conversations->each(function ($conversation) {
            $conversation->unread_count = $conversation->getUnreadCountFor(auth()->user());
        });

        return response()->json($conversations);
    }

    /**
     * Display a conversation.
     */
    public function show(string $id): JsonResponse
    {
        $conversation = Conversation::with(['listing', 'participants', 'messages.sender'])
            ->forUser(auth()->id())
            ->findOrFail($id);

        // Mark as read
        $conversation->markAsReadFor(auth()->user());

        return response()->json($conversation);
    }

    /**
     * Start a new conversation.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'recipient_id' => 'required|exists:users,id',
            'subject' => 'nullable|string',
            'message' => 'required|string',
        ]);

        // Check if conversation already exists
        $conversation = Conversation::where('listing_id', $validated['listing_id'])
            ->whereHas('participants', function ($query) use ($validated) {
                $query->where('user_id', auth()->id());
            })
            ->whereHas('participants', function ($query) use ($validated) {
                $query->where('user_id', $validated['recipient_id']);
            })
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'listing_id' => $validated['listing_id'],
                'subject' => $validated['subject'] ?? 'Inquiry about listing',
            ]);

            // Add participants
            $conversation->addParticipant(auth()->user());
            $conversation->addParticipant(\App\Models\User::find($validated['recipient_id']));
        }

        // Send message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => auth()->id(),
            'body' => $validated['message'],
        ]);

        return response()->json([
            'conversation' => $conversation,
            'message' => $message,
        ], 201);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::forUser(auth()->id())->findOrFail($id);

        $validated = $request->validate([
            'message' => 'required|string',
            'attachments' => 'nullable|array',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => auth()->id(),
            'body' => $validated['message'],
            'attachments' => $validated['attachments'] ?? null,
        ]);

        return response()->json($message, 201);
    }

    /**
     * Mark conversation as read.
     */
    public function markAsRead(string $id): JsonResponse
    {
        $conversation = Conversation::forUser(auth()->id())->findOrFail($id);
        $conversation->markAsReadFor(auth()->user());

        return response()->json(['message' => 'Conversation marked as read']);
    }
}

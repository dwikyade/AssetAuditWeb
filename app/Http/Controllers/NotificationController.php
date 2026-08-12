<?php

namespace App\Http\Controllers;

use App\Models\NotificationCustom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = NotificationCustom::forUser($request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function recent(Request $request): JsonResponse
    {
        $notifications = NotificationCustom::forUser($request->user()->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $unreadCount = NotificationCustom::forUser($request->user()->id)
            ->unread()
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, $notification): JsonResponse
    {
        $notif = NotificationCustom::findOrFail($notification);

        if ($notif->user_id && $notif->user_id !== $request->user()->id) {
            abort(403);
        }

        $notif->markAsRead();

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        NotificationCustom::forUser($request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $notification): JsonResponse
    {
        $notif = NotificationCustom::findOrFail($notification);

        if ($notif->user_id && $notif->user_id !== $request->user()->id) {
            abort(403);
        }

        $notif->delete();

        return response()->json(['success' => true]);
    }
}

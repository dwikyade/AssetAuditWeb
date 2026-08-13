<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ActivityLog::with('user:id,name,email')->orderByDesc('created_at');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%");
            });
        }

        if ($module = $request->get('module')) {
            $query->where('module', $module);
        }

        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $modules = Cache::remember('activity_log_modules', 600, function () {
            return ActivityLog::distinct()->pluck('module')->sort()->values();
        });

        return Inertia::render('ActivityLogs/Index', [
            'logs'    => $query->paginate(50)->withQueryString(),
            'filters' => $request->only(['search', 'module', 'user_id', 'date_from', 'date_to']),
            'modules' => $modules,
        ]);
    }
}

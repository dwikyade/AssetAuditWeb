<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Asset;
use App\Models\AssetAudit;
use App\Models\AuditSession;
use App\Models\ImportJob;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = Cache::remember('dashboard_stats', 60, function () {
            $totalAssets    = Asset::count();
            $activeAssets   = Asset::whereHas('status', fn ($q) => $q->where('code', 'active'))->count();
            $inactiveAssets = Asset::whereHas('status', fn ($q) => $q->whereIn('code', ['inactive', 'disposed']))->count();
            $lostAssets     = Asset::whereHas('status', fn ($q) => $q->where('code', 'lost'))->count();
            $brokenAssets   = Asset::whereHas('condition', fn ($q) => $q->where('code', 'broken'))->count();

            // Financial
            $totalAcquisition = Asset::sum('acquisition_value');
            $totalBookValue   = Asset::sum('book_value');

            // Audit
            $activeSession    = AuditSession::where('status', 'in_progress')->latest()->first();
            $auditedCount     = 0;
            $totalScope       = 0;

            if ($activeSession) {
                $auditedCount = AssetAudit::where('audit_session_id', $activeSession->id)
                    ->distinct('asset_id')->count('asset_id');
                $totalScope   = $totalAssets;
            }

            return [
                'total_assets'       => $totalAssets,
                'active_assets'      => $activeAssets,
                'inactive_assets'    => $inactiveAssets,
                'lost_assets'        => $lostAssets,
                'broken_assets'      => $brokenAssets,
                'total_acquisition'  => $totalAcquisition,
                'total_book_value'   => $totalBookValue,
                'audited_count'      => $auditedCount,
                'not_audited_count'  => max(0, $totalScope - $auditedCount),
                'audit_progress'     => $totalScope > 0 ? round(($auditedCount / $totalScope) * 100, 1) : 0,
                'active_session'     => $activeSession ? [
                    'id'   => $activeSession->id,
                    'name' => $activeSession->name,
                    'code' => $activeSession->code,
                ] : null,
            ];
        });

        // Asset by category
        $byCategory = Asset::join('asset_categories', 'assets.category_id', '=', 'asset_categories.id')
            ->selectRaw('asset_categories.name as name, COUNT(assets.id) as count')
            ->groupBy('asset_categories.id', 'asset_categories.name')
            ->orderByDesc('count')
            ->limit(8)
            ->get();

        // Asset by department
        $byDepartment = Asset::join('departments', 'assets.department_id', '=', 'departments.id')
            ->selectRaw('departments.name as name, COUNT(assets.id) as count')
            ->groupBy('departments.id', 'departments.name')
            ->orderByDesc('count')
            ->limit(8)
            ->get();

        // Asset by condition
        $byCondition = Asset::join('asset_conditions', 'assets.condition_id', '=', 'asset_conditions.id')
            ->selectRaw('asset_conditions.name as name, asset_conditions.color as color, COUNT(assets.id) as count')
            ->groupBy('asset_conditions.id', 'asset_conditions.name', 'asset_conditions.color')
            ->get();

        // Asset by status
        $byStatus = Asset::join('asset_statuses', 'assets.status_id', '=', 'asset_statuses.id')
            ->selectRaw('asset_statuses.name as name, asset_statuses.color as color, COUNT(assets.id) as count')
            ->groupBy('asset_statuses.id', 'asset_statuses.name', 'asset_statuses.color')
            ->get();

        // Recent activity
        $recentActivity = ActivityLog::with('user')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($log) => [
                'id'          => $log->id,
                'description' => $log->description ?? "{$log->action} on {$log->module}",
                'user'        => $log->user?->name ?? 'System',
                'created_at'  => $log->created_at,
            ]);

        // Alerts
        $alerts = [];

        $failedImports = ImportJob::where('status', 'failed')
            ->where('created_at', '>', now()->subDays(7))
            ->count();

        if ($failedImports > 0) {
            $alerts[] = [
                'type'    => 'error',
                'message' => "{$failedImports} import gagal dalam 7 hari terakhir.",
                'link'    => route('import.history'),
            ];
        }

        $incompleteAudit = AuditSession::whereIn('status', ['in_progress', 'scheduled'])->count();
        if ($incompleteAudit > 0) {
            $alerts[] = [
                'type'    => 'warning',
                'message' => "{$incompleteAudit} audit session belum selesai.",
                'link'    => route('audit-sessions.index'),
            ];
        }

        if ($stats['lost_assets'] > 0) {
            $alerts[] = [
                'type'    => 'warning',
                'message' => "{$stats['lost_assets']} aset berstatus Lost.",
                'link'    => route('assets.index') . '?status=lost',
            ];
        }

        return Inertia::render('Dashboard/Index', [
            'stats'          => $stats,
            'charts'         => [
                'by_category'  => $byCategory,
                'by_department' => $byDepartment,
                'by_condition' => $byCondition,
                'by_status'    => $byStatus,
            ],
            'recentActivity' => $recentActivity,
            'alerts'         => $alerts,
        ]);
    }
}

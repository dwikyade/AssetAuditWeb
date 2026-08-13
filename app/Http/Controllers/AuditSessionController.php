<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetAudit;
use App\Models\AssetCategory;
use App\Models\AuditSession;
use App\Models\Department;
use App\Models\Location;
use App\Services\ActivityLogService;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditSession::with('creator:id,name,email')->withCount([
            'audits',
            'audits as found_count' => fn ($q) => $q->where('found_status', 'found'),
        ]);

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $sessions = $query->orderByDesc('created_at')->paginate(25)->withQueryString();

        $sessions->through(function ($session) {
            $totalScope = $session->total_scope;
            $audited    = $session->audited_count;
            $session->total_scope         = $totalScope;
            $session->unique_audits_count = $audited;
            $session->progress_percent    = $totalScope > 0 ? min(100.0, round(($audited / $totalScope) * 100, 1)) : 0.0;
            return $session;
        });

        return Inertia::render('Audits/Sessions/Index', [
            'sessions' => $sessions,
            'filters'  => $request->only(['status', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Audits/Sessions/Create', [
            'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'locations'   => Location::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'categories'  => AssetCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'start_date'      => 'nullable|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
            'scope_type'      => 'required|in:all,department,location,category,selection',
            'scope_ids'       => 'nullable|array',
            'completion_mode' => 'required|in:strict,flexible',
        ]);

        $session = AuditSession::create(array_merge($data, [
            'code'       => 'AUD-' . strtoupper(\Illuminate\Support\Str::random(6)),
            'status'     => 'draft',
            'created_by' => auth()->id(),
        ]));

        ActivityLogService::log('create', 'audit', get_class($session), $session->id, description: "Audit session {$session->name} dibuat");

        return redirect()->route('audit-sessions.show', $session)->with('success', 'Audit session berhasil dibuat.');
    }

    public function show(AuditSession $auditSession): Response
    {
        $auditSession->load([
            'creator:id,name,email',
            'audits.asset:id,asset_code,asset_name',
            'audits.auditor:id,name,email',
            'audits.condition:id,name,color'
        ]);

        $progressData = $auditSession->progress;

        return Inertia::render('Audits/Sessions/Show', [
            'session' => $auditSession,
            'stats'   => [
                'total_scope' => $progressData['total_scope'],
                'audited'     => $progressData['audited'],
                'not_audited' => $progressData['not_audited'],
                'found'       => $progressData['found'],
                'not_found'   => $progressData['not_found'],
                'mismatches'  => $progressData['mismatches'],
                'progress'    => $progressData['percent'],
            ],
        ]);
    }

    public function edit(AuditSession $auditSession): Response
    {
        return Inertia::render('Audits/Sessions/Edit', [
            'session'     => $auditSession,
            'departments' => Department::where('is_active', true)->get(['id', 'name']),
            'locations'   => Location::where('is_active', true)->get(['id', 'name']),
            'categories'  => AssetCategory::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, AuditSession $auditSession): RedirectResponse
    {
        if (!in_array($auditSession->status, ['draft', 'scheduled'])) {
            return back()->with('error', 'Audit session yang sudah berjalan tidak dapat diedit.');
        }

        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'start_date'      => 'nullable|date',
            'end_date'        => 'nullable|date',
            'scope_type'      => 'required|in:all,department,location,category,selection',
            'scope_ids'       => 'nullable|array',
            'completion_mode' => 'required|in:strict,flexible',
        ]);

        $auditSession->update($data);
        return redirect()->route('audit-sessions.show', $auditSession)->with('success', 'Audit session berhasil diperbarui.');
    }

    public function destroy(AuditSession $auditSession): RedirectResponse
    {
        if ($auditSession->status === 'in_progress') {
            return back()->with('error', 'Audit session yang sedang berjalan tidak dapat dihapus.');
        }
        $auditSession->delete();
        return redirect()->route('audit-sessions.index')->with('success', 'Audit session berhasil dihapus.');
    }

    public function start(AuditSession $auditSession): RedirectResponse
    {
        if ($auditSession->status !== 'draft' && $auditSession->status !== 'scheduled') {
            return back()->with('error', 'Hanya session dengan status Draft atau Scheduled yang dapat dimulai.');
        }

        $auditSession->update(['status' => 'in_progress', 'started_at' => now()]);
        CacheService::clearDashboardCache();
        ActivityLogService::log('start', 'audit', get_class($auditSession), $auditSession->id, description: "Audit session {$auditSession->name} dimulai");

        return redirect()->route('audit-sessions.conduct', $auditSession)->with('success', 'Audit session dimulai.');
    }

    public function complete(Request $request, AuditSession $auditSession): RedirectResponse
    {
        if ($auditSession->status !== 'in_progress') {
            return back()->with('error', 'Hanya session In Progress yang dapat diselesaikan.');
        }

        $totalScope = $auditSession->total_scope;
        $audited    = $auditSession->audited_count;

        if ($auditSession->completion_mode === 'strict' && $audited < $totalScope) {
            $remaining = $totalScope - $audited;
            return back()->with('error', "Mode Strict: masih ada {$remaining} aset yang belum diaudit.");
        }

        $auditSession->update(['status' => 'completed', 'completed_at' => now()]);
        CacheService::clearDashboardCache();
        ActivityLogService::log('complete', 'audit', get_class($auditSession), $auditSession->id, description: "Audit session {$auditSession->name} selesai");

        return redirect()->route('audit-sessions.show', $auditSession)->with('success', 'Audit session berhasil diselesaikan.');
    }

    public function cancel(AuditSession $auditSession): RedirectResponse
    {
        $auditSession->update(['status' => 'cancelled']);
        CacheService::clearDashboardCache();
        ActivityLogService::log('cancel', 'audit', get_class($auditSession), $auditSession->id, description: "Audit session {$auditSession->name} dibatalkan");

        return back()->with('success', 'Audit session dibatalkan.');
    }

    public function progress(AuditSession $auditSession): JsonResponse
    {
        $progressData = $auditSession->progress;

        return response()->json([
            'total'    => $progressData['total_scope'],
            'audited'  => $progressData['audited'],
            'progress' => $progressData['percent'],
            'status'   => $auditSession->status,
        ]);
    }

    private function countScope(AuditSession $session): int
    {
        return $session->total_scope;
    }
}

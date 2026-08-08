<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetAudit;
use App\Models\AssetCategory;
use App\Models\AuditSession;
use App\Models\Department;
use App\Models\Location;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AuditSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditSession::with('creator')->withCount([
            'audits',
            'audits as found_count'  => fn ($q) => $q->where('found_status', 'found'),
        ]);

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
        }

        return Inertia::render('Audits/Sessions/Index', [
            'sessions' => $query->orderByDesc('created_at')->paginate(25)->withQueryString(),
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
            'code'       => 'AUD-' . strtoupper(Str::random(6)),
            'status'     => 'draft',
            'created_by' => auth()->id(),
        ]));

        ActivityLogService::log('create', 'audit', get_class($session), $session->id, description: "Audit session {$session->name} dibuat");

        return redirect()->route('audit-sessions.show', $session)->with('success', 'Audit session berhasil dibuat.');
    }

    public function show(AuditSession $auditSession): Response
    {
        $auditSession->load(['creator', 'audits.asset', 'audits.auditor', 'audits.condition']);

        $totalScope = $this->countScope($auditSession);
        $audited    = $auditSession->audits()->distinct('asset_id')->count('asset_id');
        $found      = $auditSession->audits()->where('found_status', 'found')->count();
        $notFound   = $auditSession->audits()->where('found_status', 'not_found')->count();
        $mismatches = $auditSession->audits()->where('result', 'mismatch')->count();

        return Inertia::render('Audits/Sessions/Show', [
            'session' => $auditSession,
            'stats'   => [
                'total_scope' => $totalScope,
                'audited'     => $audited,
                'not_audited' => max(0, $totalScope - $audited),
                'found'       => $found,
                'not_found'   => $notFound,
                'mismatches'  => $mismatches,
                'progress'    => $totalScope > 0 ? round(($audited / $totalScope) * 100, 1) : 0,
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
        ActivityLogService::log('start', 'audit', get_class($auditSession), $auditSession->id, description: "Audit session {$auditSession->name} dimulai");

        return redirect()->route('audit-sessions.conduct', $auditSession)->with('success', 'Audit session dimulai.');
    }

    public function complete(Request $request, AuditSession $auditSession): RedirectResponse
    {
        if ($auditSession->status !== 'in_progress') {
            return back()->with('error', 'Hanya session In Progress yang dapat diselesaikan.');
        }

        $totalScope = $this->countScope($auditSession);
        $audited    = $auditSession->audits()->distinct('asset_id')->count('asset_id');

        if ($auditSession->completion_mode === 'strict' && $audited < $totalScope) {
            $remaining = $totalScope - $audited;
            return back()->with('error', "Mode Strict: masih ada {$remaining} aset yang belum diaudit.");
        }

        $auditSession->update(['status' => 'completed', 'completed_at' => now()]);
        ActivityLogService::log('complete', 'audit', get_class($auditSession), $auditSession->id, description: "Audit session {$auditSession->name} selesai");

        return redirect()->route('audit-sessions.show', $auditSession)->with('success', 'Audit session berhasil diselesaikan.');
    }

    public function cancel(AuditSession $auditSession): RedirectResponse
    {
        $auditSession->update(['status' => 'cancelled']);
        ActivityLogService::log('cancel', 'audit', get_class($auditSession), $auditSession->id, description: "Audit session {$auditSession->name} dibatalkan");

        return back()->with('success', 'Audit session dibatalkan.');
    }

    public function progress(AuditSession $auditSession): JsonResponse
    {
        $totalScope = $this->countScope($auditSession);
        $audited    = $auditSession->audits()->distinct('asset_id')->count('asset_id');

        return response()->json([
            'total'    => $totalScope,
            'audited'  => $audited,
            'progress' => $totalScope > 0 ? round(($audited / $totalScope) * 100, 1) : 0,
            'status'   => $auditSession->status,
        ]);
    }

    private function countScope(AuditSession $session): int
    {
        return match ($session->scope_type) {
            'department' => Asset::whereIn('department_id', $session->scope_ids ?? [])->count(),
            'location'   => Asset::whereIn('location_id', $session->scope_ids ?? [])->count(),
            'category'   => Asset::whereIn('category_id', $session->scope_ids ?? [])->count(),
            'selection'  => count($session->scope_ids ?? []),
            default      => Asset::count(),
        };
    }
}


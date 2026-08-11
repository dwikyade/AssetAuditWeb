<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetAudit;
use App\Models\AssetCategory;
use App\Models\AssetCondition;
use App\Models\AssetStatus;
use App\Models\AuditSession;
use App\Models\Department;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Rap2hpoutre\FastExcel\FastExcel;
use SimpleSoftwareIO\QrCode\Facades\QrCode;


class ReportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Reports/Index');
    }

    public function assetRegister(Request $request): Response
    {
        $query = Asset::with(['category', 'department', 'location', 'status', 'condition'])
            ->when($request->get('category_id'), fn ($q, $v) => $q->where('category_id', $v))
            ->when($request->get('department_id'), fn ($q, $v) => $q->where('department_id', $v))
            ->when($request->get('status_id'), fn ($q, $v) => $q->where('status_id', $v));

        return Inertia::render('Reports/AssetRegister', [
            'assets'  => $query->paginate(50)->withQueryString(),
            'filters' => $request->only(['category_id', 'department_id', 'status_id']),
            'totals'  => [
                'acquisition' => $query->sum('acquisition_value'),
                'book_value'  => $query->sum('book_value'),
                'count'       => $query->count(),
            ],
        ]);
    }

    public function audit(Request $request): Response
    {
        $sessions = AuditSession::with('creator')
            ->when($request->get('status'), fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('Reports/AuditReport', [
            'sessions' => $sessions,
            'filters'  => $request->only(['status']),
        ]);
    }

    public function missing(Request $request): Response
    {
        $session = AuditSession::where('status', 'completed')
            ->latest()
            ->first();

        $missingAssets = collect();

        if ($session) {
            $auditedIds   = AssetAudit::where('audit_session_id', $session->id)->pluck('asset_id');
            $missingAssets = Asset::with(['category', 'department', 'location'])
                ->whereNotIn('id', $auditedIds)
                ->paginate(50);
        }

        return Inertia::render('Reports/MissingAssets', [
            'missing_assets' => $missingAssets,
            'session'        => $session,
        ]);
    }

    public function mismatch(Request $request): Response
    {
        $audits = AssetAudit::with(['asset.category', 'asset.location', 'auditor', 'condition', 'location'])
            ->where('result', 'mismatch')
            ->when($request->get('session_id'), fn ($q, $v) => $q->where('audit_session_id', $v))
            ->orderByDesc('audit_time')
            ->paginate(50);

        return Inertia::render('Reports/Mismatch', [
            'audits'   => $audits,
            'sessions' => AuditSession::orderByDesc('created_at')->get(['id', 'name', 'code']),
            'filters'  => $request->only(['session_id']),
        ]);
    }

    public function condition(Request $request): Response
    {
        $byCondition = Asset::join('asset_conditions', 'assets.condition_id', '=', 'asset_conditions.id')
            ->selectRaw('asset_conditions.name, asset_conditions.color, COUNT(assets.id) as count')
            ->groupBy('asset_conditions.id', 'asset_conditions.name', 'asset_conditions.color')
            ->get();

        return Inertia::render('Reports/ConditionReport', [
            'by_condition' => $byCondition,
            'assets'       => Asset::with(['category', 'location', 'condition'])
                ->when($request->get('condition_id'), fn ($q, $v) => $q->where('condition_id', $v))
                ->paginate(50)->withQueryString(),
            'filters'      => $request->only(['condition_id']),
        ]);
    }

    public function department(Request $request): Response
    {
        $byDepartment = Asset::join('departments', 'assets.department_id', '=', 'departments.id')
            ->selectRaw('departments.name, COUNT(assets.id) as count, SUM(assets.book_value) as total_book_value')
            ->groupBy('departments.id', 'departments.name')
            ->orderByDesc('count')
            ->get();

        return Inertia::render('Reports/DepartmentReport', [
            'by_department' => $byDepartment,
        ]);
    }

    public function financial(Request $request): Response
    {
        $summary = Asset::selectRaw('
            SUM(acquisition_value) as total_acquisition,
            SUM(previous_accumulated_depreciation) as total_prev_accumulated,
            SUM(accumulated_depreciation) as total_accumulated,
            SUM(book_value) as total_book_value,
            COUNT(*) as total_assets
        ')->first();

        $byCategory = Asset::join('asset_categories', 'assets.category_id', '=', 'asset_categories.id')
            ->selectRaw('asset_categories.name, SUM(assets.acquisition_value) as acquisition, SUM(assets.book_value) as book_value, COUNT(assets.id) as count')
            ->groupBy('asset_categories.id', 'asset_categories.name')
            ->orderByDesc('acquisition')
            ->get();

        return Inertia::render('Reports/Financial', [
            'summary'     => $summary,
            'by_category' => $byCategory,
        ]);
    }

    public function exportIndex(): Response
    {
        return Inertia::render('Export/Index');
    }

    public function qrExportPage(Request $request): Response
    {
        $query = Asset::query()->with(['category', 'department', 'location', 'status', 'condition']);

        if ($search = $request->get('search')) {
            $query->search($search);
        }
        if ($v = $request->get('category_id'))  $query->where('category_id', $v);
        if ($v = $request->get('department_id')) $query->where('department_id', $v);
        if ($v = $request->get('location_id'))  $query->where('location_id', $v);
        if ($v = $request->get('status_id'))    $query->where('status_id', $v);
        if ($v = $request->get('condition_id')) $query->where('condition_id', $v);

        $assets = $query->orderBy('asset_code')->limit(500)->get([
            'id', 'asset_code', 'asset_name', 'qr_token',
            'category_id', 'department_id', 'location_id', 'status_id', 'condition_id',
        ]);

        return Inertia::render('Export/QrExport', [
            'assets'      => $assets,
            'categories'  => AssetCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'locations'   => Location::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'statuses'    => AssetStatus::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color']),
            'conditions'  => AssetCondition::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color']),
            'filters'     => $request->only(['search', 'category_id', 'department_id', 'location_id', 'status_id', 'condition_id']),
        ]);
    }

    public function exportAssets(Request $request)
    {
        $assets = Asset::with(['category', 'department', 'location', 'status', 'condition'])
            ->get()
            ->map(fn ($a) => [
                'Kode'              => $a->asset_code,
                'Nama Aset'         => $a->asset_name,
                'Kategori'          => $a->category?->name,
                'Departemen'        => $a->department?->name,
                'Lokasi'            => $a->location?->name,
                'Qty'               => $a->quantity,
                'Unit'              => $a->unit,
                'Nilai Perolehan'   => $a->acquisition_value,
                'Nilai Buku'        => $a->book_value,
                'Status'            => $a->status?->name,
                'Kondisi'           => $a->condition?->name,
                'Tanggal Perolehan' => $a->acquisition_date?->format('d/m/Y'),
            ]);

        return (new FastExcel($assets))->download('asset-register-' . now()->format('Y-m-d') . '.xlsx');
    }

    public function exportAudit(Request $request)
    {
        $sessionId = $request->get('session_id');
        $audits    = AssetAudit::with(['asset', 'auditor', 'condition', 'location', 'auditSession'])
            ->when($sessionId, fn ($q) => $q->where('audit_session_id', $sessionId))
            ->orderByDesc('audit_time')
            ->get()
            ->map(fn ($a) => [
                'Session'       => $a->auditSession?->name,
                'Kode Aset'     => $a->asset?->asset_code,
                'Nama Aset'     => $a->asset?->asset_name,
                'Auditor'       => $a->auditor?->name,
                'Waktu Audit'   => $a->audit_time?->format('d/m/Y H:i'),
                'Found Status'  => $a->found_status,
                'Kondisi'       => $a->condition?->name,
                'Lokasi'        => $a->location?->name,
                'Qty Ditemukan' => $a->quantity_found,
                'Result'        => $a->result,
                'Metode'        => $a->verification_method,
                'Catatan'       => $a->notes,
            ]);

        return (new FastExcel($audits))->download('audit-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    public function qrBulk(Request $request): JsonResponse
    {
        $this->authorize('asset.view');

        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return response()->json(['error' => 'Tidak ada aset dipilih'], 422);
        }

        // Cap at 100 to avoid timeout
        $ids = array_slice((array) $ids, 0, 100);

        $assets = Asset::whereIn('id', $ids)
            ->orderBy('asset_code')
            ->with(['category', 'location'])
            ->get(['id', 'asset_code', 'asset_name', 'qr_token', 'category_id', 'location_id']);

        $result = $assets->map(function ($asset) {
            try {
                $url   = route('qr.redirect', $asset->qr_token);
                $qrSvg = (string) QrCode::format('svg')->size(200)->generate($url);
            } catch (\Throwable $e) {
                $qrSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><text y="100" x="50" fill="red">Error</text></svg>';
            }
            return [
                'id'         => $asset->id,
                'asset_code' => $asset->asset_code,
                'asset_name' => $asset->asset_name,
                'category'   => $asset->category?->name,
                'location'   => $asset->location?->name,
                'qr_svg'     => $qrSvg,
            ];
        });

        return response()->json($result);
    }
}


<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetCodePrefix;
use App\Models\AssetCondition;
use App\Models\AssetMovement;
use App\Models\AssetStatus;
use App\Models\Department;
use App\Models\Location;
use App\Services\ActivityLogService;
use App\Services\AssetCodeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Http\JsonResponse;

class AssetController extends Controller
{
    public function lookup(Request $request): JsonResponse
    {
        $code = $request->get('code');
        if (!$code) {
            return response()->json(['error' => 'Code is required'], 400);
        }

        $asset = Asset::with(['category', 'department', 'location', 'status', 'condition'])
            ->where('asset_code', $code)
            ->first();

        if (!$asset) {
            return response()->json(['error' => 'Asset not found'], 404);
        }

        return response()->json($asset);
    }

    public function index(Request $request): Response
    {
        $this->authorize('asset.view');

        $query = Asset::query()
            ->with(['category', 'department', 'location', 'status', 'condition', 'latestAudit'])
            ->withCount('audits');

        // Search
        if ($search = $request->get('search')) {
            $query->search($search);
        }

        // Filters
        if ($categoryId = $request->get('category_id')) {
            $query->where('category_id', $categoryId);
        }
        if ($departmentId = $request->get('department_id')) {
            $query->where('department_id', $departmentId);
        }
        if ($locationId = $request->get('location_id')) {
            $query->where('location_id', $locationId);
        }
        if ($statusId = $request->get('status_id')) {
            $query->where('status_id', $statusId);
        }
        if ($conditionId = $request->get('condition_id')) {
            $query->where('condition_id', $conditionId);
        }

        // Sorting
        $sortBy  = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowed = ['asset_code', 'asset_name', 'quantity', 'acquisition_date', 'acquisition_value', 'book_value', 'created_at'];
        if (in_array($sortBy, $allowed)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = in_array($request->get('per_page'), [25, 50, 100]) ? $request->get('per_page') : 25;
        $assets  = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Assets/Index', [
            'assets'      => $assets,
            'filters'     => $request->only(['search', 'category_id', 'department_id', 'location_id', 'status_id', 'condition_id', 'sort_by', 'sort_dir', 'per_page']),
            'categories'  => AssetCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'locations'   => Location::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'statuses'    => AssetStatus::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color']),
            'conditions'  => AssetCondition::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('asset.create');

        return Inertia::render('Assets/Create', [
            'categories'  => AssetCategory::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'locations'   => Location::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'parent_id']),
            'statuses'    => AssetStatus::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color', 'is_default']),
            'conditions'  => AssetCondition::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color', 'is_default']),
            'prefixes'    => AssetCodePrefix::where('is_active', true)->orderBy('prefix')->get(['id', 'prefix', 'name', 'format', 'next_number', 'number_length']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('asset.create');

        $data = $request->validate([
            'code_mode'    => 'required|in:manual,auto',
            'asset_code'   => 'required_if:code_mode,manual|nullable|string|max:50|unique:assets,asset_code',
            'prefix_id'    => 'required_if:code_mode,auto|nullable|integer|exists:asset_code_prefixes,id',
            'asset_name'   => 'required|string|max:255',
            'description'  => 'nullable|string',
            'category_id'  => 'nullable|integer|exists:asset_categories,id',
            'department_id'=> 'nullable|integer|exists:departments,id',
            'location_id'  => 'nullable|integer|exists:locations,id',
            'quantity'     => 'required|numeric|min:0',
            'unit'         => 'nullable|string|max:30',
            'acquisition_date'                  => 'nullable|date',
            'depreciation_end_date'             => 'nullable|date',
            'acquisition_value'                 => 'nullable|numeric|min:0',
            'previous_accumulated_depreciation' => 'nullable|numeric|min:0',
            'accumulated_depreciation'          => 'nullable|numeric|min:0',
            'depreciation_per_period'           => 'nullable|numeric|min:0',
            'book_value'                        => 'nullable|numeric|min:0',
            'status_id'    => 'nullable|integer|exists:asset_statuses,id',
            'condition_id' => 'nullable|integer|exists:asset_conditions,id',
            'serial_number'=> 'nullable|string|max:100',
            'brand'        => 'nullable|string|max:100',
            'model'        => 'nullable|string|max:100',
            'notes'        => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $data) {
            // Determine asset code
            if ($data['code_mode'] === 'auto') {
                $assetCode = AssetCodeService::generate($data['prefix_id']);
            } else {
                $assetCode = trim($data['asset_code']);
                if (!AssetCodeService::validateManualCode($assetCode)) {
                    return back()->withErrors(['asset_code' => "Kode aset '{$assetCode}' sudah digunakan."]);
                }
            }

            $asset = Asset::create([
                'asset_code'   => $assetCode,
                'asset_name'   => $data['asset_name'],
                'description'  => $data['description'] ?? null,
                'category_id'  => $data['category_id'] ?? null,
                'department_id'=> $data['department_id'] ?? null,
                'location_id'  => $data['location_id'] ?? null,
                'quantity'     => $data['quantity'],
                'unit'         => $data['unit'] ?? null,
                'acquisition_date'                  => $data['acquisition_date'] ?? null,
                'depreciation_end_date'             => $data['depreciation_end_date'] ?? null,
                'acquisition_value'                 => $data['acquisition_value'] ?? null,
                'previous_accumulated_depreciation' => $data['previous_accumulated_depreciation'] ?? null,
                'accumulated_depreciation'          => $data['accumulated_depreciation'] ?? null,
                'depreciation_per_period'           => $data['depreciation_per_period'] ?? null,
                'book_value'                        => $data['book_value'] ?? null,
                'status_id'    => $data['status_id'] ?? null,
                'condition_id' => $data['condition_id'] ?? null,
                'serial_number'=> $data['serial_number'] ?? null,
                'brand'        => $data['brand'] ?? null,
                'model'        => $data['model'] ?? null,
                'notes'        => $data['notes'] ?? null,
                'created_by'   => auth()->id(),
            ]);

            // Invalidate dashboard cache
            Cache::forget('dashboard_stats');

            ActivityLogService::logModelChange('create', 'asset', $asset, [], $asset->toArray(), "Asset {$asset->asset_code} dibuat");

            return redirect()->route('assets.show', $asset)->with('success', "Asset {$asset->asset_code} berhasil ditambahkan.");
        });
    }

    public function show(Asset $asset): Response
    {
        $this->authorize('asset.view');

        $asset->load([
            'category', 'department', 'location', 'status', 'condition',
            'photos', 'movements.fromLocation', 'movements.toLocation', 'movements.movedBy',
            'audits.auditor', 'audits.condition', 'audits.location', 'audits.auditSession',
            'creator',
        ]);

        return Inertia::render('Assets/Show', [
            'asset' => $asset,
        ]);
    }

    public function edit(Asset $asset): Response
    {
        $this->authorize('asset.update');

        return Inertia::render('Assets/Edit', [
            'asset'       => $asset->load(['category', 'department', 'location', 'status', 'condition']),
            'categories'  => AssetCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'locations'   => Location::where('is_active', true)->orderBy('name')->get(['id', 'name', 'parent_id']),
            'statuses'    => AssetStatus::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color']),
            'conditions'  => AssetCondition::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color']),
        ]);
    }

    public function update(Request $request, Asset $asset): RedirectResponse
    {
        $this->authorize('asset.update');

        $data = $request->validate([
            'asset_name'   => 'required|string|max:255',
            'description'  => 'nullable|string',
            'category_id'  => 'nullable|integer|exists:asset_categories,id',
            'department_id'=> 'nullable|integer|exists:departments,id',
            'location_id'  => 'nullable|integer|exists:locations,id',
            'quantity'     => 'required|numeric|min:0',
            'unit'         => 'nullable|string|max:30',
            'acquisition_date'                  => 'nullable|date',
            'depreciation_end_date'             => 'nullable|date',
            'acquisition_value'                 => 'nullable|numeric|min:0',
            'previous_accumulated_depreciation' => 'nullable|numeric|min:0',
            'accumulated_depreciation'          => 'nullable|numeric|min:0',
            'depreciation_per_period'           => 'nullable|numeric|min:0',
            'book_value'                        => 'nullable|numeric|min:0',
            'status_id'    => 'nullable|integer|exists:asset_statuses,id',
            'condition_id' => 'nullable|integer|exists:asset_conditions,id',
            'serial_number'=> 'nullable|string|max:100',
            'brand'        => 'nullable|string|max:100',
            'model'        => 'nullable|string|max:100',
            'notes'        => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $asset, $data) {
            $oldValues = $asset->toArray();

            // Track location change
            $oldLocationId   = $asset->location_id;
            $oldDepartmentId = $asset->department_id;

            $asset->update(array_merge($data, ['updated_by' => auth()->id()]));

            // Record movement if location/department changed
            if ($oldLocationId !== $asset->location_id || $oldDepartmentId !== $asset->department_id) {
                AssetMovement::create([
                    'asset_id'          => $asset->id,
                    'from_department_id'=> $oldDepartmentId,
                    'to_department_id'  => $asset->department_id,
                    'from_location_id'  => $oldLocationId,
                    'to_location_id'    => $asset->location_id,
                    'reason'            => $request->get('move_reason', 'Data update'),
                    'moved_by'          => auth()->id(),
                    'moved_at'          => now(),
                ]);
            }

            Cache::forget('dashboard_stats');
            ActivityLogService::logModelChange('update', 'asset', $asset, $oldValues, $asset->toArray(), "Asset {$asset->asset_code} diperbarui");

            return redirect()->route('assets.show', $asset)->with('success', "Asset {$asset->asset_code} berhasil diperbarui.");
        });
    }

    public function destroy(Asset $asset): RedirectResponse
    {
        $this->authorize('asset.delete');

        $code = $asset->asset_code;
        ActivityLogService::logModelChange('delete', 'asset', $asset, $asset->toArray(), [], "Asset {$code} dihapus (soft delete)");

        $asset->delete(); // Soft delete
        Cache::forget('dashboard_stats');

        return redirect()->route('assets.index')->with('success', "Asset {$code} berhasil dihapus.");
    }

    public function qr(Asset $asset)
    {
        $this->authorize('asset.view');

        $url = route('qr.redirect', $asset->qr_token);

        $qrSvg = (string) QrCode::format('svg')->size(300)->generate($url);

        return Inertia::render('Assets/Qr', [
            'asset'  => $asset->load(['category', 'department', 'location']),
            'qr_svg' => $qrSvg,
            'qr_url' => $url,
        ]);
    }

    public function qrJson(Asset $asset): JsonResponse
    {
        $this->authorize('asset.view');

        $url = route('qr.redirect', $asset->qr_token);
        $qrSvg = (string) QrCode::format('svg')->size(256)->generate($url);

        return response()->json([
            'qr_svg' => $qrSvg,
            'qr_url' => $url,
        ]);
    }

    public function qrExport(Request $request): Response
    {
        $this->authorize('asset.view');

        $query = Asset::query()->with(['category', 'department', 'location', 'status', 'condition']);

        if ($search = $request->get('search')) {
            $query->search($search);
        }
        if ($categoryId = $request->get('category_id')) {
            $query->where('category_id', $categoryId);
        }
        if ($departmentId = $request->get('department_id')) {
            $query->where('department_id', $departmentId);
        }
        if ($locationId = $request->get('location_id')) {
            $query->where('location_id', $locationId);
        }
        if ($statusId = $request->get('status_id')) {
            $query->where('status_id', $statusId);
        }
        if ($conditionId = $request->get('condition_id')) {
            $query->where('condition_id', $conditionId);
        }

        $assets = $query->orderBy('asset_code')->limit(500)->get([
            'id', 'asset_code', 'asset_name', 'qr_token',
            'category_id', 'department_id', 'location_id', 'status_id', 'condition_id',
        ]);

        return Inertia::render('Assets/QrExport', [
            'assets'      => $assets,
            'categories'  => AssetCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'locations'   => Location::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'statuses'    => AssetStatus::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color']),
            'conditions'  => AssetCondition::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color']),
            'filters'     => $request->only(['search', 'category_id', 'department_id', 'location_id', 'status_id', 'condition_id']),
        ]);
    }

    public function qrBulk(Request $request): JsonResponse
    {
        $this->authorize('asset.view');

        $ids = $request->input('ids', []);
        if (empty($ids) || count($ids) > 200) {
            return response()->json(['error' => 'Invalid selection'], 400);
        }

        $assets = Asset::whereIn('id', $ids)->orderBy('asset_code')
            ->with(['category', 'location'])
            ->get(['id', 'asset_code', 'asset_name', 'qr_token', 'category_id', 'location_id']);

        $result = $assets->map(function ($asset) {
            $url    = route('qr.redirect', $asset->qr_token);
            $qrSvg  = (string) QrCode::format('svg')->size(200)->generate($url);
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

    public function regenerateQr(Asset $asset): RedirectResponse
    {
        $this->authorize('asset.update');

        $oldToken = $asset->qr_token;
        $asset->update(['qr_token' => Str::random(32)]);

        ActivityLogService::log('regenerate_qr', 'asset', get_class($asset), $asset->id, description: "QR token untuk {$asset->asset_code} di-regenerate");

        return redirect()->route('assets.qr', $asset)->with('success', 'QR Code berhasil di-regenerate.');
    }

    private function authorize(string $permission): void
    {
        if (!auth()->user()->can($permission)) {
            abort(403, 'Anda tidak memiliki akses untuk tindakan ini.');
        }
    }
}

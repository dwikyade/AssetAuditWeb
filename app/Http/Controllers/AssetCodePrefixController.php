<?php

namespace App\Http\Controllers;

use App\Models\AssetCodePrefix;
use App\Services\ActivityLogService;
use App\Services\AssetCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetCodePrefixController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AssetCodePrefix::withCount(['creator']);

        if ($search = $request->get('search')) {
            $query->where('prefix', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
        }

        return Inertia::render('AssetCodes/Index', [
            'prefixes' => $query->orderBy('prefix')->paginate(25)->withQueryString(),
            'filters'  => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('AssetCodes/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'prefix'        => 'required|string|max:20|unique:asset_code_prefixes,prefix',
            'name'          => 'required|string|max:100',
            'description'   => 'nullable|string',
            'format'        => 'required|string|max:50',
            'number_length' => 'required|integer|min:1|max:10',
            'next_number'   => 'required|integer|min:1',
            'is_active'     => 'boolean',
        ]);

        $prefix = AssetCodePrefix::create(array_merge($data, ['created_by' => auth()->id()]));
        ActivityLogService::log('create', 'prefix', get_class($prefix), $prefix->id, description: "Prefix {$prefix->prefix} dibuat");

        return redirect()->route('asset-code-prefixes.index')->with('success', "Prefix {$prefix->prefix} berhasil ditambahkan.");
    }

    public function edit(AssetCodePrefix $assetCodePrefix): Response
    {
        return Inertia::render('AssetCodes/Edit', [
            'prefix' => $assetCodePrefix,
        ]);
    }

    public function update(Request $request, AssetCodePrefix $assetCodePrefix): RedirectResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:100',
            'description'   => 'nullable|string',
            'format'        => 'required|string|max:50',
            'number_length' => 'required|integer|min:1|max:10',
            'next_number'   => 'required|integer|min:1',
        ]);

        $old = $assetCodePrefix->toArray();
        $assetCodePrefix->update($data);
        ActivityLogService::logModelChange('update', 'prefix', $assetCodePrefix, $old, $assetCodePrefix->toArray());

        return redirect()->route('asset-code-prefixes.index')->with('success', "Prefix {$assetCodePrefix->prefix} berhasil diperbarui.");
    }

    public function destroy(AssetCodePrefix $assetCodePrefix): RedirectResponse
    {
        // Can never delete - deactivate instead
        return back()->with('error', 'Prefix tidak dapat dihapus. Gunakan fitur Deactivate.');
    }

    public function deactivate(AssetCodePrefix $prefix): RedirectResponse
    {
        $prefix->update(['is_active' => false]);
        ActivityLogService::log('deactivate', 'prefix', get_class($prefix), $prefix->id, description: "Prefix {$prefix->prefix} dinonaktifkan");

        return back()->with('success', "Prefix {$prefix->prefix} berhasil dinonaktifkan.");
    }

    public function preview(AssetCodePrefix $prefix): JsonResponse
    {
        try {
            $code = AssetCodeService::preview($prefix->id);
            return response()->json(['code' => $code]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}

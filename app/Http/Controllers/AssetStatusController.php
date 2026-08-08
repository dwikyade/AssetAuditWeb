<?php

namespace App\Http\Controllers;

use App\Models\AssetStatus;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetStatusController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Statuses/Index', [
            'statuses' => AssetStatus::withCount('assets')->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code'        => 'required|string|max:30|unique:asset_statuses,code',
            'name'        => 'required|string|max:100',
            'color'       => 'required|string|max:20',
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|integer',
        ]);

        $status = AssetStatus::create(array_merge($data, ['is_active' => true]));
        ActivityLogService::log('create', 'status', get_class($status), $status->id, description: "Status {$status->name} dibuat");

        return back()->with('success', "Status {$status->name} berhasil ditambahkan.");
    }

    public function update(Request $request, AssetStatus $assetStatus): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'color'       => 'required|string|max:20',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'sort_order'  => 'nullable|integer',
        ]);

        $assetStatus->update($data);
        return back()->with('success', "Status {$assetStatus->name} berhasil diperbarui.");
    }

    public function destroy(AssetStatus $assetStatus): RedirectResponse
    {
        if ($assetStatus->assets()->count() > 0) {
            return back()->with('error', 'Status tidak dapat dihapus karena masih digunakan.');
        }
        if ($assetStatus->is_default) {
            return back()->with('error', 'Status default tidak dapat dihapus.');
        }
        $assetStatus->delete();
        return back()->with('success', 'Status berhasil dihapus.');
    }
}


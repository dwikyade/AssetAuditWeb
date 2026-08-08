<?php

namespace App\Http\Controllers;

use App\Models\AssetCondition;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetConditionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Conditions/Index', [
            'conditions' => AssetCondition::withCount('assets')->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code'        => 'required|string|max:30|unique:asset_conditions,code',
            'name'        => 'required|string|max:100',
            'color'       => 'required|string|max:20',
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|integer',
        ]);

        $condition = AssetCondition::create(array_merge($data, ['is_active' => true]));
        return back()->with('success', "Kondisi {$condition->name} berhasil ditambahkan.");
    }

    public function update(Request $request, AssetCondition $assetCondition): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'color'       => 'required|string|max:20',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'sort_order'  => 'nullable|integer',
        ]);

        $assetCondition->update($data);
        return back()->with('success', "Kondisi {$assetCondition->name} berhasil diperbarui.");
    }

    public function destroy(AssetCondition $assetCondition): RedirectResponse
    {
        if ($assetCondition->assets()->count() > 0) {
            return back()->with('error', 'Kondisi tidak dapat dihapus karena masih digunakan oleh aset.');
        }
        $assetCondition->delete();
        return back()->with('success', 'Kondisi berhasil dihapus.');
    }
}


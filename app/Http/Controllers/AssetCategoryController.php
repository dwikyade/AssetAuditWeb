<?php

namespace App\Http\Controllers;

use App\Models\AssetCategory;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AssetCategory::withCount('assets');

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
        }

        return Inertia::render('Categories/Index', [
            'categories' => $query->orderBy('name')->paginate(25)->withQueryString(),
            'filters'    => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Categories/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code'        => 'required|string|max:20|unique:asset_categories,code',
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $category = AssetCategory::create($data);
        ActivityLogService::log('create', 'category', get_class($category), $category->id, description: "Kategori {$category->name} dibuat");

        return redirect()->route('categories.index')->with('success', "Kategori {$category->name} berhasil ditambahkan.");
    }

    public function edit(AssetCategory $category): Response
    {
        return Inertia::render('Categories/Edit', [
            'category' => $category->loadCount('assets'),
        ]);
    }

    public function update(Request $request, AssetCategory $category): RedirectResponse
    {
        $data = $request->validate([
            'code'        => "required|string|max:20|unique:asset_categories,code,{$category->id}",
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $old = $category->toArray();
        $category->update($data);
        ActivityLogService::logModelChange('update', 'category', $category, $old, $category->toArray());

        return redirect()->route('categories.index')->with('success', "Kategori {$category->name} berhasil diperbarui.");
    }

    public function destroy(AssetCategory $category): RedirectResponse
    {
        if ($category->assets()->count() > 0) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih memiliki aset.');
        }

        ActivityLogService::log('delete', 'category', get_class($category), $category->id, description: "Kategori {$category->name} dihapus");
        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil dihapus.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Services\ActivityLogService;
use App\Services\CacheService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Location::with('parent')->withCount('assets');

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
        }

        return Inertia::render('Locations/Index', [
            'locations' => $query->orderBy('name')->paginate(25)->withQueryString(),
            'filters'   => $request->only(['search']),
            'parents'   => Location::whereNull('parent_id')->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('locations.index');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code'        => 'required|string|max:30|unique:locations,code',
            'name'        => 'required|string|max:100',
            'parent_id'   => 'nullable|integer|exists:locations,id',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $location = Location::create($data);
        CacheService::clearMasterData();
        ActivityLogService::log('create', 'location', get_class($location), $location->id, description: "Lokasi {$location->name} dibuat");

        return redirect()->route('locations.index')->with('success', "Lokasi {$location->name} berhasil ditambahkan.");
    }

    public function edit(Location $location): RedirectResponse
    {
        return redirect()->route('locations.index');
    }

    public function update(Request $request, Location $location): RedirectResponse
    {
        $data = $request->validate([
            'code'        => "required|string|max:30|unique:locations,code,{$location->id}",
            'name'        => 'required|string|max:100',
            'parent_id'   => 'nullable|integer|exists:locations,id',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        // Prevent direct and indirect circular references
        if (!empty($data['parent_id']) && (int) $data['parent_id'] === $location->id) {
            return back()->withErrors(['parent_id' => 'Lokasi tidak dapat menjadi parent-nya sendiri.']);
        }

        if (!empty($data['parent_id']) && $this->isDescendant($location, (int) $data['parent_id'])) {
            return back()->withErrors(['parent_id' => 'Lokasi tidak dapat menggunakan sub-lokasi sebagai parent.']);
        }

        $old = $location->toArray();
        $location->update($data);
        CacheService::clearMasterData();
        ActivityLogService::logModelChange('update', 'location', $location, $old, $location->toArray());

        return redirect()->route('locations.index')->with('success', "Lokasi {$location->name} berhasil diperbarui.");
    }

    public function destroy(Location $location): RedirectResponse
    {
        if ($location->assets()->count() > 0) {
            return back()->with('error', 'Lokasi tidak dapat dihapus karena masih memiliki aset.');
        }
        if ($location->children()->count() > 0) {
            return back()->with('error', 'Lokasi tidak dapat dihapus karena masih memiliki sub-lokasi.');
        }

        ActivityLogService::log('delete', 'location', get_class($location), $location->id, description: "Lokasi {$location->name} dihapus");
        $location->delete();
        CacheService::clearMasterData();

        return redirect()->route('locations.index')->with('success', 'Lokasi berhasil dihapus.');
    }

    public function show(Location $location): RedirectResponse
    {
        return redirect()->route('locations.index');
    }

    private function isDescendant(Location $location, int $parentId): bool
    {
        $parent = Location::find($parentId);
        $visited = [];

        while ($parent) {
            if ($parent->id === $location->id) {
                return true;
            }

            if (isset($visited[$parent->id])) {
                return true;
            }

            $visited[$parent->id] = true;
            $parent = $parent->parent;
        }

        return false;
    }

    /**
     * Return location tree for dropdowns
     */
    public function tree(): JsonResponse
    {
        $locations = Location::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'parent_id'])
            ->toArray();

        return response()->json($locations);
    }
}

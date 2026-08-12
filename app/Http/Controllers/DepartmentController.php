<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Department::withCount('assets');

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
        }

        return Inertia::render('Departments/Index', [
            'departments' => $query->orderBy('name')->paginate(25)->withQueryString(),
            'filters'     => $request->only(['search']),
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('departments.index');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code'        => 'required|string|max:20|unique:departments,code',
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $dept = Department::create($data);
        ActivityLogService::log('create', 'department', get_class($dept), $dept->id, description: "Departemen {$dept->name} dibuat");

        return redirect()->route('departments.index')->with('success', "Departemen {$dept->name} berhasil ditambahkan.");
    }

    public function edit(Department $department): RedirectResponse
    {
        return redirect()->route('departments.index');
    }

    public function update(Request $request, Department $department): RedirectResponse
    {
        $data = $request->validate([
            'code'        => "required|string|max:20|unique:departments,code,{$department->id}",
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $old = $department->toArray();
        $department->update($data);
        ActivityLogService::logModelChange('update', 'department', $department, $old, $department->toArray());

        return redirect()->route('departments.index')->with('success', "Departemen {$department->name} berhasil diperbarui.");
    }

    public function destroy(Department $department): RedirectResponse
    {
        if ($department->assets()->count() > 0) {
            return back()->with('error', 'Departemen tidak dapat dihapus karena masih memiliki aset.');
        }

        ActivityLogService::log('delete', 'department', get_class($department), $department->id, description: "Departemen {$department->name} dihapus");
        $department->delete();

        return redirect()->route('departments.index')->with('success', 'Departemen berhasil dihapus.');
    }
}

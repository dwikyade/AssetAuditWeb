<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Roles/Index', [
            'roles'       => Role::with('permissions')->withCount('users')->get(),
            'permissions' => Permission::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100|unique:roles,name',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);
        if (!empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        $roleName = Str::title(str_replace('_', ' ', $role->name));
        return back()->with('success', "Role {$roleName} berhasil dibuat.");
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $data = $request->validate([
            'permissions' => 'array',
        ]);

        $role->syncPermissions($data['permissions'] ?? []);

        $roleName = Str::title(str_replace('_', ' ', $role->name));
        return back()->with('success', "Permissions untuk role {$roleName} berhasil diperbarui.");
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin') {
            return back()->with('error', 'Role Super Admin tidak dapat dihapus.');
        }
        $roleName = Str::title(str_replace('_', ' ', $role->name));
        $role->delete();
        return back()->with('success', "Role {$roleName} berhasil dihapus.");
    }
}


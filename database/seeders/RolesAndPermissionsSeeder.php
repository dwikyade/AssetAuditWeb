<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions
        $permissions = [
            // Asset permissions
            'asset.view', 'asset.create', 'asset.update', 'asset.delete',
            'asset.import', 'asset.export', 'asset.change_code',

            // Audit permissions
            'audit.view', 'audit.create', 'audit.update', 'audit.delete',
            'audit.approve', 'audit.conduct',

            // Report permissions
            'report.view', 'report.export',

            // User permissions
            'user.view', 'user.create', 'user.update', 'user.delete',

            // System permissions
            'system.manage',
            'activity-log.view',

            // Master data permissions
            'category.manage', 'department.manage', 'location.manage',
            'status.manage', 'condition.manage', 'prefix.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Super Admin: all permissions
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // Asset Admin / IT Admin
        $assetAdmin = Role::firstOrCreate(['name' => 'asset_admin', 'guard_name' => 'web']);
        $assetAdmin->syncPermissions([
            'asset.view', 'asset.create', 'asset.update',
            'asset.import', 'asset.export',
            'audit.view', 'audit.create', 'audit.update', 'audit.conduct',
            'report.view', 'report.export',
            'activity-log.view',
            'category.manage', 'department.manage', 'location.manage',
            'prefix.manage',
        ]);

        // Auditor
        $auditor = Role::firstOrCreate(['name' => 'auditor', 'guard_name' => 'web']);
        $auditor->syncPermissions([
            'asset.view',
            'audit.view', 'audit.conduct',
            'report.view',
        ]);

        // Department User
        $deptUser = Role::firstOrCreate(['name' => 'department_user', 'guard_name' => 'web']);
        $deptUser->syncPermissions([
            'asset.view',
            'audit.view',
        ]);

        // Management (read-only)
        $management = Role::firstOrCreate(['name' => 'management', 'guard_name' => 'web']);
        $management->syncPermissions([
            'asset.view',
            'audit.view',
            'report.view',
            'activity-log.view',
        ]);
    }
}

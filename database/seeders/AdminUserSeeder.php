<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@hotel.com'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('password'),
            ]
        );
        $superAdmin->assignRole('super_admin');

        // Asset Admin
        $assetAdmin = User::firstOrCreate(
            ['email' => 'assetadmin@hotel.com'],
            [
                'name'     => 'Asset Admin',
                'password' => Hash::make('password'),
            ]
        );
        $assetAdmin->assignRole('asset_admin');

        // Auditor
        $auditor = User::firstOrCreate(
            ['email' => 'auditor@hotel.com'],
            [
                'name'     => 'Auditor',
                'password' => Hash::make('password'),
            ]
        );
        $auditor->assignRole('auditor');

        $this->command->info('Default users created:');
        $this->command->info('  Super Admin:  admin@hotel.com / password');
        $this->command->info('  Asset Admin:  assetadmin@hotel.com / password');
        $this->command->info('  Auditor:      auditor@hotel.com / password');
    }
}

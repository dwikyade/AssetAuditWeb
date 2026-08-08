<?php

namespace Database\Seeders;

use App\Models\AssetCondition;
use App\Models\AssetStatus;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            DefaultMasterDataSeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}

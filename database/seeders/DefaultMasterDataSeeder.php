<?php

namespace Database\Seeders;

use App\Models\AssetCondition;
use App\Models\AssetStatus;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class DefaultMasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Asset Statuses
        $statuses = [
            ['code' => 'active',       'name' => 'Active',       'color' => 'green',  'is_default' => true,  'sort_order' => 1],
            ['code' => 'inactive',     'name' => 'Inactive',     'color' => 'gray',   'is_default' => false, 'sort_order' => 2],
            ['code' => 'disposed',     'name' => 'Disposed',     'color' => 'red',    'is_default' => false, 'sort_order' => 3],
            ['code' => 'lost',         'name' => 'Lost',         'color' => 'orange', 'is_default' => false, 'sort_order' => 4],
            ['code' => 'under_repair', 'name' => 'Under Repair', 'color' => 'yellow', 'is_default' => false, 'sort_order' => 5],
            ['code' => 'transferred',  'name' => 'Transferred',  'color' => 'blue',   'is_default' => false, 'sort_order' => 6],
        ];

        foreach ($statuses as $status) {
            AssetStatus::firstOrCreate(
                ['code' => $status['code']],
                array_merge($status, ['is_active' => true])
            );
        }

        // Asset Conditions
        $conditions = [
            ['code' => 'good',         'name' => 'Good',         'color' => 'green',  'is_default' => true,  'sort_order' => 1],
            ['code' => 'minor_damage', 'name' => 'Minor Damage', 'color' => 'yellow', 'is_default' => false, 'sort_order' => 2],
            ['code' => 'major_damage', 'name' => 'Major Damage', 'color' => 'orange', 'is_default' => false, 'sort_order' => 3],
            ['code' => 'broken',       'name' => 'Broken',       'color' => 'red',    'is_default' => false, 'sort_order' => 4],
            ['code' => 'missing',      'name' => 'Missing',      'color' => 'gray',   'is_default' => false, 'sort_order' => 5],
            ['code' => 'under_repair', 'name' => 'Under Repair', 'color' => 'blue',   'is_default' => false, 'sort_order' => 6],
        ];

        foreach ($conditions as $condition) {
            AssetCondition::firstOrCreate(
                ['code' => $condition['code']],
                array_merge($condition, ['is_active' => true])
            );
        }

        // System Settings defaults
        $settings = [
            ['key' => 'app_name',              'value' => 'Hotel Asset Audit System', 'type' => 'string',  'group' => 'general',  'label' => 'Application Name'],
            ['key' => 'hotel_name',            'value' => 'Hotel',                   'type' => 'string',  'group' => 'general',  'label' => 'Hotel Name'],
            ['key' => 'import_max_file_size',  'value' => '10240',                   'type' => 'integer', 'group' => 'import',   'label' => 'Max Import File Size (KB)'],
            ['key' => 'import_chunk_size',     'value' => '500',                     'type' => 'integer', 'group' => 'import',   'label' => 'Import Chunk Size'],
            ['key' => 'photo_max_size',        'value' => '5120',                    'type' => 'integer', 'group' => 'assets',   'label' => 'Max Photo Size (KB)'],
            ['key' => 'default_pagination',    'value' => '25',                      'type' => 'integer', 'group' => 'display',  'label' => 'Default Rows Per Page'],
            ['key' => 'qr_base_url',           'value' => '',                        'type' => 'string',  'group' => 'qr',       'label' => 'QR Code Base URL'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::firstOrCreate(['key' => $setting['key']], $setting);
        }
    }
}

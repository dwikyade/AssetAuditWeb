<?php

namespace App\Services;

use App\Models\AssetCategory;
use App\Models\AssetCodePrefix;
use App\Models\AssetCondition;
use App\Models\AssetStatus;
use App\Models\Department;
use App\Models\Location;
use Illuminate\Support\Facades\Cache;

class CacheService
{
    public static function getMasterData(): array
    {
        return Cache::remember('master_data_shared', 3600, function () {
            return [
                'categories'  => AssetCategory::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
                'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
                'locations'   => Location::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'parent_id']),
                'statuses'    => AssetStatus::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color', 'is_default']),
                'conditions'  => AssetCondition::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color', 'is_default']),
                'prefixes'    => AssetCodePrefix::where('is_active', true)->orderBy('prefix')->get(['id', 'prefix', 'name', 'format', 'next_number', 'number_length']),
            ];
        });
    }

    public static function clearMasterData(): void
    {
        Cache::forget('master_data_shared');
    }

    public static function clearDashboardCache(): void
    {
        Cache::forget('dashboard_stats');
        Cache::forget('dashboard_charts');
    }

    public static function clearSystemSettingsCache(): void
    {
        Cache::forget('system_settings_shared');
        Cache::forget('system_settings');
    }
}

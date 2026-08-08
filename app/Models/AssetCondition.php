<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetCondition extends Model
{
    protected $fillable = ['code', 'name', 'color', 'description', 'is_default', 'is_active', 'sort_order'];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active'  => 'boolean',
    ];

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class, 'condition_id');
    }

    public function assetAudits(): HasMany
    {
        return $this->hasMany(AssetAudit::class, 'condition_id');
    }
}

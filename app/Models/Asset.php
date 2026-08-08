<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Asset extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'asset_code', 'asset_name', 'description',
        'category_id', 'department_id', 'location_id',
        'quantity', 'unit',
        'acquisition_date', 'depreciation_end_date',
        'acquisition_value', 'previous_accumulated_depreciation',
        'accumulated_depreciation', 'depreciation_per_period', 'book_value',
        'status_id', 'condition_id',
        'serial_number', 'brand', 'model',
        'qr_token', 'notes', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'acquisition_date'                   => 'date',
        'depreciation_end_date'              => 'date',
        'acquisition_value'                  => 'decimal:2',
        'previous_accumulated_depreciation'  => 'decimal:2',
        'accumulated_depreciation'           => 'decimal:2',
        'depreciation_per_period'            => 'decimal:2',
        'book_value'                         => 'decimal:2',
        'quantity'                           => 'decimal:2',
    ];

    /**
     * Boot model: generate QR token on creation
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Asset $asset) {
            if (empty($asset->qr_token)) {
                $asset->qr_token = Str::random(32);
            }
        });
    }

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'category_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(AssetStatus::class, 'status_id');
    }

    public function condition(): BelongsTo
    {
        return $this->belongsTo(AssetCondition::class, 'condition_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(AssetPhoto::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(AssetMovement::class)->orderBy('created_at', 'desc');
    }

    public function audits(): HasMany
    {
        return $this->hasMany(AssetAudit::class)->orderBy('audit_time', 'desc');
    }

    public function latestAudit(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(AssetAudit::class)->latestOfMany('audit_time');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereHas('status', fn ($q) => $q->where('code', 'active'));
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('asset_code', 'like', "%{$search}%")
              ->orWhere('asset_name', 'like', "%{$search}%")
              ->orWhere('serial_number', 'like', "%{$search}%")
              ->orWhere('brand', 'like', "%{$search}%")
              ->orWhere('model', 'like', "%{$search}%");
        });
    }

    // Accessors
    public function getPrimaryPhotoAttribute(): ?AssetPhoto
    {
        return $this->photos->firstWhere('is_primary', true) ?? $this->photos->first();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetAudit extends Model
{
    protected $fillable = [
        'audit_session_id', 'asset_id', 'auditor_id', 'audit_time',
        'found_status', 'condition_id', 'location_id', 'quantity_found',
        'result', 'verification_method', 'notes', 'photo_path',
        'latitude', 'longitude',
    ];

    protected $casts = [
        'audit_time'     => 'datetime',
        'quantity_found' => 'decimal:2',
        'latitude'       => 'decimal:8',
        'longitude'      => 'decimal:8',
    ];

    public function auditSession(): BelongsTo
    {
        return $this->belongsTo(AuditSession::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function auditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }

    public function condition(): BelongsTo
    {
        return $this->belongsTo(AssetCondition::class, 'condition_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id');
    }
}

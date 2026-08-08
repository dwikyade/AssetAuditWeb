<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AuditSession extends Model
{
    protected $fillable = [
        'code', 'name', 'description',
        'start_date', 'end_date', 'status',
        'scope_type', 'scope_ids', 'completion_mode',
        'created_by', 'started_at', 'completed_at',
    ];

    protected $casts = [
        'start_date'   => 'date',
        'end_date'     => 'date',
        'started_at'   => 'datetime',
        'completed_at' => 'datetime',
        'scope_ids'    => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function audits(): HasMany
    {
        return $this->hasMany(AssetAudit::class);
    }

    public function getProgressAttribute(): array
    {
        $total   = $this->audits()->count();
        $found   = $this->audits()->where('found_status', 'found')->count();
        $percent = $total > 0 ? round(($found / $total) * 100, 1) : 0;

        return [
            'total'   => $total,
            'found'   => $found,
            'percent' => $percent,
        ];
    }
}

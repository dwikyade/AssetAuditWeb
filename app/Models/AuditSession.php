<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

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

    public function getTotalScopeAttribute(): int
    {
        $ids = is_array($this->scope_ids) ? $this->scope_ids : [];
        return match ($this->scope_type) {
            'department' => empty($ids) ? 0 : Asset::whereIn('department_id', $ids)->count(),
            'location'   => empty($ids) ? 0 : Asset::whereIn('location_id', $ids)->count(),
            'category'   => empty($ids) ? 0 : Asset::whereIn('category_id', $ids)->count(),
            'selection'  => count($ids),
            default      => Asset::count(),
        };
    }

    public function getAuditedCountAttribute(): int
    {
        return AssetAudit::where('audit_session_id', $this->id)
            ->distinct('asset_id')
            ->count('asset_id');
    }

    public function getProgressAttribute(): array
    {
        $totalScope = $this->total_scope;
        $audited    = $this->audited_count;
        $found      = $this->audits()->where('found_status', 'found')->count();
        $notFound   = $this->audits()->where('found_status', 'not_found')->count();
        $mismatches = $this->audits()->where('result', 'mismatch')->count();
        $percent    = $totalScope > 0 ? min(100.0, round(($audited / $totalScope) * 100, 1)) : 0.0;

        return [
            'total_scope' => $totalScope,
            'audited'     => $audited,
            'not_audited' => max(0, $totalScope - $audited),
            'found'       => $found,
            'not_found'   => $notFound,
            'mismatches'  => $mismatches,
            'percent'     => $percent,
        ];
    }
}

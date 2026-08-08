<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ImportJob extends Model
{
    protected $fillable = [
        'file_name', 'file_path', 'file_hash', 'file_size', 'mode',
        'total_rows', 'valid_rows', 'warning_rows', 'error_rows',
        'created_rows', 'updated_rows', 'skipped_rows', 'failed_rows', 'processed_rows',
        'status', 'column_mapping', 'uploaded_by',
        'started_at', 'completed_at', 'error_file_path', 'error_message',
    ];

    protected $casts = [
        'started_at'     => 'datetime',
        'completed_at'   => 'datetime',
        'column_mapping' => 'array',
        'file_size'      => 'integer',
        'total_rows'     => 'integer',
        'valid_rows'     => 'integer',
        'warning_rows'   => 'integer',
        'error_rows'     => 'integer',
        'created_rows'   => 'integer',
        'updated_rows'   => 'integer',
        'skipped_rows'   => 'integer',
        'failed_rows'    => 'integer',
        'processed_rows' => 'integer',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function errors(): HasMany
    {
        return $this->hasMany(ImportError::class);
    }

    public function getProgressPercentAttribute(): float
    {
        if ($this->total_rows === 0) return 0;
        return round(($this->processed_rows / $this->total_rows) * 100, 1);
    }
}

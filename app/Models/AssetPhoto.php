<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetPhoto extends Model
{
    protected $fillable = [
        'asset_id', 'file_path', 'file_name', 'mime_type',
        'file_size', 'is_primary', 'uploaded_by',
    ];

    protected $casts = ['is_primary' => 'boolean'];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}

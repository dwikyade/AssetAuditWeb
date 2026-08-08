<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetCodePrefix extends Model
{
    protected $fillable = [
        'prefix', 'name', 'description', 'format',
        'number_length', 'next_number', 'is_active', 'created_by',
    ];

    protected $casts = [
        'is_active'   => 'boolean',
        'next_number' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Generate the next asset code based on this prefix configuration
     */
    public function generateCode(): string
    {
        $number  = str_pad($this->next_number, $this->number_length, '0', STR_PAD_LEFT);
        $code    = str_replace(
            ['{PREFIX}', '{NUMBER}'],
            [$this->prefix, $number],
            $this->format
        );
        return $code;
    }
}

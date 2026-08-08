<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetCodePrefix;
use Illuminate\Support\Facades\DB;

class AssetCodeService
{
    /**
     * Generate next asset code for a given prefix (atomic/transaction-safe)
     *
     * @throws \RuntimeException if prefix is inactive or collision cannot be resolved
     */
    public static function generate(int $prefixId): string
    {
        return DB::transaction(function () use ($prefixId) {
            // Lock the row to prevent concurrent generation
            $prefix = AssetCodePrefix::lockForUpdate()->findOrFail($prefixId);

            if (!$prefix->is_active) {
                throw new \RuntimeException("Prefix '{$prefix->prefix}' is not active.");
            }

            $attempts = 0;
            $maxAttempts = 100;

            do {
                $code = $prefix->generateCode();

                // Check if this code already exists
                $exists = Asset::withTrashed()->where('asset_code', $code)->exists();

                if (!$exists) {
                    // Increment next_number
                    $prefix->increment('next_number');
                    return $code;
                }

                // Code collision - try next number
                $prefix->increment('next_number');
                $attempts++;

            } while ($attempts < $maxAttempts);

            throw new \RuntimeException("Cannot generate unique code for prefix '{$prefix->prefix}' after {$maxAttempts} attempts.");
        });
    }

    /**
     * Validate that a manual code is unique
     */
    public static function validateManualCode(string $code, ?int $excludeAssetId = null): bool
    {
        $query = Asset::withTrashed()->where('asset_code', $code);

        if ($excludeAssetId) {
            $query->where('id', '!=', $excludeAssetId);
        }

        return !$query->exists();
    }

    /**
     * Preview next code without incrementing
     */
    public static function preview(int $prefixId): string
    {
        $prefix = AssetCodePrefix::findOrFail($prefixId);

        $attempts = 0;
        $nextNumber = $prefix->next_number;

        do {
            $number = str_pad($nextNumber, $prefix->number_length, '0', STR_PAD_LEFT);
            $code   = str_replace(['{PREFIX}', '{NUMBER}'], [$prefix->prefix, $number], $prefix->format);

            $exists = Asset::withTrashed()->where('asset_code', $code)->exists();
            if (!$exists) {
                return $code;
            }
            $nextNumber++;
            $attempts++;
        } while ($attempts < 100);

        return $code; // Best effort
    }
}

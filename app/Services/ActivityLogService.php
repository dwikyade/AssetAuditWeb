<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Request;

class ActivityLogService
{
    /**
     * Log an activity
     */
    public static function log(
        string $action,
        string $module,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $description = null
    ): void {
        try {
            ActivityLog::create([
                'user_id'     => Auth::id(),
                'action'      => $action,
                'module'      => $module,
                'entity_type' => $entityType,
                'entity_id'   => $entityId,
                'old_values'  => $oldValues,
                'new_values'  => $newValues,
                'ip_address'  => Request::ip(),
                'user_agent'  => Request::userAgent(),
                'description' => $description,
                'created_at'  => now(),
            ]);

            Cache::forget('activity_log_modules');
        } catch (\Throwable $e) {
            // Don't let logging failure break the main flow
            logger()->error('Failed to log activity: ' . $e->getMessage());
        }
    }

    /**
     * Log model changes (old vs new values)
     */
    public static function logModelChange(
        string $action,
        string $module,
        object $model,
        array $oldValues = [],
        array $newValues = [],
        ?string $description = null
    ): void {
        // Remove sensitive fields
        $sensitiveFields = ['password', 'remember_token', 'token'];
        $oldValues       = array_diff_key($oldValues, array_flip($sensitiveFields));
        $newValues       = array_diff_key($newValues, array_flip($sensitiveFields));

        static::log(
            $action,
            $module,
            get_class($model),
            $model->getKey(),
            $oldValues ?: null,
            $newValues ?: null,
            $description
        );
    }
}

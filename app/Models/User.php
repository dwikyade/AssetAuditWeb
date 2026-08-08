<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function createdAssets()
    {
        return $this->hasMany(Asset::class, 'created_by');
    }

    public function auditSessions()
    {
        return $this->hasMany(AuditSession::class, 'created_by');
    }

    public function assetAudits()
    {
        return $this->hasMany(AssetAudit::class, 'auditor_id');
    }

    public function importJobs()
    {
        return $this->hasMany(ImportJob::class, 'uploaded_by');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }
}

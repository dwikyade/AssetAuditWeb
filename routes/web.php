<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\AssetStatusController;
use App\Http\Controllers\AssetConditionController;
use App\Http\Controllers\AssetCodePrefixController;
use App\Http\Controllers\AuditSessionController;
use App\Http\Controllers\AssetAuditController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\QrController;
use Illuminate\Support\Facades\Route;

// Auth routes (guest only)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

// QR redirect (public - for scanning)
Route::get('/asset/qr/{token}', [QrController::class, 'redirect'])->name('qr.redirect');

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Assets
    Route::resource('assets', AssetController::class);
    Route::get('assets/{asset}/qr', [AssetController::class, 'qr'])->name('assets.qr');
    Route::post('assets/{asset}/qr/regenerate', [AssetController::class, 'regenerateQr'])->name('assets.qr.regenerate');

    // Master Data
    Route::resource('categories', AssetCategoryController::class);
    Route::resource('departments', DepartmentController::class);
    Route::resource('locations', LocationController::class);
    Route::get('locations/tree', [LocationController::class, 'tree'])->name('locations.tree');
    Route::resource('asset-statuses', AssetStatusController::class);
    Route::resource('asset-conditions', AssetConditionController::class);
    Route::resource('asset-code-prefixes', AssetCodePrefixController::class);
    Route::post('asset-code-prefixes/{prefix}/preview', [AssetCodePrefixController::class, 'preview'])->name('asset-code-prefixes.preview');
    Route::post('asset-code-prefixes/{prefix}/deactivate', [AssetCodePrefixController::class, 'deactivate'])->name('asset-code-prefixes.deactivate');

    // Audit
    Route::get('api/assets/lookup', [AssetController::class, 'lookup'])->name('assets.lookup');
    Route::resource('audit-sessions', AuditSessionController::class);
    Route::post('audit-sessions/{session}/start', [AuditSessionController::class, 'start'])->name('audit-sessions.start');
    Route::post('audit-sessions/{session}/complete', [AuditSessionController::class, 'complete'])->name('audit-sessions.complete');
    Route::post('audit-sessions/{session}/cancel', [AuditSessionController::class, 'cancel'])->name('audit-sessions.cancel');
    Route::get('audit-sessions/{session}/conduct', [AssetAuditController::class, 'conduct'])->name('audit-sessions.conduct');
    Route::post('audit-sessions/{session}/audits', [AssetAuditController::class, 'store'])->name('asset-audits.store');
    Route::get('audit-sessions/{session}/audits/{audit}', [AssetAuditController::class, 'show'])->name('asset-audits.show');
    Route::get('audit-sessions/{session}/progress', [AuditSessionController::class, 'progress'])->name('audit-sessions.progress');

    // Import / Export
    Route::get('import', [ImportController::class, 'index'])->name('import.index');
    Route::post('import/upload', [ImportController::class, 'upload'])->name('import.upload');
    Route::post('import/{job}/validate', [ImportController::class, 'validateRows'])->name('import.validate');
    Route::post('import/{job}/start', [ImportController::class, 'startImport'])->name('import.start');
    Route::get('import/{job}/progress', [ImportController::class, 'progress'])->name('import.progress');
    Route::get('import/history', [ImportController::class, 'history'])->name('import.history');
    Route::get('import/{job}', [ImportController::class, 'show'])->name('import.show');
    Route::get('import/{job}/download-errors', [ImportController::class, 'downloadErrors'])->name('import.download-errors');
    Route::get('import/template/download', [ImportController::class, 'downloadTemplate'])->name('import.template');

    Route::get('export', [ReportController::class, 'exportIndex'])->name('export.index');
    Route::post('export/assets', [ReportController::class, 'exportAssets'])->name('export.assets');
    Route::post('export/audit', [ReportController::class, 'exportAudit'])->name('export.audit');

    // Reports
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/asset-register', [ReportController::class, 'assetRegister'])->name('reports.asset-register');
    Route::get('reports/audit', [ReportController::class, 'audit'])->name('reports.audit');
    Route::get('reports/missing', [ReportController::class, 'missing'])->name('reports.missing');
    Route::get('reports/mismatch', [ReportController::class, 'mismatch'])->name('reports.mismatch');
    Route::get('reports/condition', [ReportController::class, 'condition'])->name('reports.condition');
    Route::get('reports/department', [ReportController::class, 'department'])->name('reports.department');
    Route::get('reports/financial', [ReportController::class, 'financial'])->name('reports.financial');

    // Users & Roles (admin only)
    Route::middleware(['role:super_admin'])->group(function () {
        Route::resource('users', UserController::class);
        Route::resource('roles', \App\Http\Controllers\RoleController::class);
        Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
        Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('settings', [SettingController::class, 'update'])->name('settings.update');
    });

    // Activity logs (limited access)
    Route::get('activity-logs', [ActivityLogController::class, 'index'])
        ->middleware('permission:activity-log.view')
        ->name('activity-logs.index');
});


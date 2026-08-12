<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetAudit;
use App\Models\AssetCondition;
use App\Models\AuditSession;
use App\Models\Location;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetAuditController extends Controller
{
    /**
     * Show the mobile-friendly audit conduct page
     */
    public function conduct(AuditSession $auditSession): Response
    {
        if ($auditSession->status !== 'in_progress') {
            abort(403, 'Audit session tidak sedang berjalan.');
        }

        $auditedAssetIds = AssetAudit::where('audit_session_id', $auditSession->id)
            ->pluck('asset_id')
            ->toArray();

        $uniqueAuditedIds = array_unique($auditedAssetIds);
        $totalScope = $auditSession->total_scope;

        return Inertia::render('Audits/Conduct', [
            'session'         => $auditSession->load('creator'),
            'conditions'      => AssetCondition::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'color']),
            'locations'       => Location::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'audited_ids'     => array_values($uniqueAuditedIds),
            'total_scope'     => $totalScope,
            'audited_count'   => count($uniqueAuditedIds),
        ]);
    }

    /**
     * Submit an audit record for an asset
     */
    public function store(Request $request, AuditSession $auditSession): RedirectResponse
    {
        if ($auditSession->status !== 'in_progress') {
            return back()->with('error', 'Audit session tidak sedang berjalan.');
        }

        $data = $request->validate([
            'asset_id'            => 'required|integer|exists:assets,id',
            'found_status'        => 'required|in:found,not_found,partially_found',
            'condition_id'        => 'nullable|integer|exists:asset_conditions,id',
            'location_id'         => 'nullable|integer|exists:locations,id',
            'quantity_found'      => 'nullable|numeric|min:0',
            'result'              => 'required|in:match,mismatch,issue',
            'verification_method' => 'required|in:manual,qr_scan,barcode',
            'notes'               => 'nullable|string|max:1000',
            'latitude'            => 'nullable|numeric',
            'longitude'           => 'nullable|numeric',
        ]);

        $asset = Asset::findOrFail($data['asset_id']);

        // Check if already audited in this session
        $existing = AssetAudit::where('audit_session_id', $auditSession->id)
            ->where('asset_id', $data['asset_id'])
            ->first();

        if ($existing) {
            // Warn but allow override
            $request->session()->flash('warning', "Asset {$asset->asset_code} sudah pernah diaudit dalam session ini. Data lama akan dipertahankan sebagai histori.");
        }

        $audit = AssetAudit::create([
            'audit_session_id'    => $auditSession->id,
            'asset_id'            => $data['asset_id'],
            'auditor_id'          => auth()->id(),
            'audit_time'          => now(),
            'found_status'        => $data['found_status'],
            'condition_id'        => $data['condition_id'] ?? null,
            'location_id'         => $data['location_id'] ?? null,
            'quantity_found'      => $data['quantity_found'] ?? null,
            'result'              => $data['result'],
            'verification_method' => $data['verification_method'],
            'notes'               => $data['notes'] ?? null,
            'latitude'            => $data['latitude'] ?? null,
            'longitude'           => $data['longitude'] ?? null,
        ]);

        // Update asset condition if found and condition provided
        if ($data['found_status'] === 'found' && $data['condition_id']) {
            $asset->update(['condition_id' => $data['condition_id']]);
        }

        ActivityLogService::log(
            'audit', 'asset', get_class($asset), $asset->id,
            description: "Asset {$asset->asset_code} diaudit - {$data['found_status']} - {$data['result']}"
        );

        return back()->with('success', "Audit asset {$asset->asset_code} berhasil disimpan.");
    }

    public function show(AuditSession $auditSession, AssetAudit $audit): Response
    {
        $audit->load(['asset.category', 'asset.location', 'auditor', 'condition', 'location', 'auditSession']);

        return Inertia::render('Audits/AuditDetail', [
            'audit'   => $audit,
            'session' => $auditSession,
        ]);
    }
}

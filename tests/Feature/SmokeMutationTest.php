<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetCondition;
use App\Models\AssetStatus;
use App\Models\AuditSession;
use App\Models\Department;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SmokeMutationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['database.default' => 'mysql']);
        // ensure we have base data
        if (AssetCategory::count() === 0) {
            AssetCategory::create(['code' => 'CAT', 'name' => 'Test Category']);
        }
        if (Department::count() === 0) {
            Department::create(['code' => 'DEP', 'name' => 'Test Dept']);
        }
        if (Location::count() === 0) {
            Location::create(['code' => 'LOC', 'name' => 'Test Loc']);
        }
    }

    private function admin()
    {
        $user = User::where('email', 'admin@hotel.com')->first();
        return $this->actingAs($user);
    }

    public function test_category_crud(): void
    {
        $this->admin();
        $create = $this->post('/categories', ['code' => 'SMOKE', 'name' => 'Smoke Cat', 'is_active' => true]);
        $this->assertNotEquals(500, $create->getStatusCode(), 'category store 500');
        $cat = AssetCategory::where('code', 'SMOKE')->first();
        $this->assertNotNull($cat, 'category not created');
        $upd = $this->put("/categories/{$cat->id}", ['code' => 'SMOKE', 'name' => 'Smoke Cat 2', 'is_active' => true]);
        $this->assertNotEquals(500, $upd->getStatusCode(), 'category update 500');
        $del = $this->delete("/categories/{$cat->id}");
        $this->assertNotEquals(500, $del->getStatusCode(), 'category delete 500');
    }

    public function test_asset_crud_and_qr(): void
    {
        $this->admin();
        $cat = AssetCategory::first();
        $dep = Department::first();
        $loc = Location::first();
        $code = 'ASMK' . time();
        $resp = $this->post('/assets', [
            'code_mode' => 'manual',
            'asset_code' => $code,
            'asset_name' => 'Smoke Asset',
            'category_id' => $cat->id,
            'department_id' => $dep->id,
            'location_id' => $loc->id,
            'quantity' => 1,
        ]);
        $this->assertNotEquals(500, $resp->getStatusCode(), 'asset store 500: ' . $resp->status());
        $asset = Asset::where('asset_code', $code)->first();
        $this->assertNotNull($asset, 'asset not created');

        // QR endpoints
        $qr = $this->get("/assets/{$asset->id}/qr");
        $this->assertNotEquals(500, $qr->getStatusCode(), 'asset qr 500');
        $qrJson = $this->get("/assets/{$asset->id}/qr/json");
        $this->assertNotEquals(500, $qrJson->getStatusCode(), 'asset qr/json 500');
        $regen = $this->post("/assets/{$asset->id}/qr/regenerate");
        $this->assertNotEquals(500, $regen->getStatusCode(), 'qr regenerate 500');

        // update + delete
        $upd = $this->put("/assets/{$asset->id}", [
            'asset_name' => 'Smoke Asset 2',
            'category_id' => $cat->id, 'department_id' => $dep->id, 'location_id' => $loc->id, 'quantity' => 2,
        ]);
        $this->assertNotEquals(500, $upd->getStatusCode(), 'asset update 500');
        $del = $this->delete("/assets/{$asset->id}");
        $this->assertNotEquals(500, $del->getStatusCode(), 'asset delete 500');
    }

    public function test_export_assets_download(): void
    {
        $this->admin();
        $resp = $this->post('/export/assets');
        $this->assertNotEquals(500, $resp->getStatusCode(), 'export assets 500');
        // Should be a download (200 with file stream) or at least not crash
        $this->assertContains($resp->getStatusCode(), [200, 302], 'export assets unexpected status');
    }

    public function test_qr_bulk_export(): void
    {
        $this->admin();
        $asset = Asset::first();
        if ($asset) {
            $resp = $this->post('/export/qr-bulk', ['ids' => [$asset->id]]);
            $this->assertNotEquals(500, $resp->getStatusCode(), 'qr bulk 500');
        }
        $this->assertTrue(true);
    }

    public function test_import_template_download(): void
    {
        $this->admin();
        $resp = $this->get('/import/template/download');
        $this->assertNotEquals(500, $resp->getStatusCode(), 'import template 500');
    }

    public function test_audit_session_full_flow(): void
    {
        $this->admin();
        $resp = $this->post('/audit-sessions', [
            'name' => 'Smoke Audit',
            'code' => 'SMK-AUD',
            'description' => 'test',
            'start_date' => now()->format('Y-m-d'),
        ]);
        $this->assertNotEquals(500, $resp->getStatusCode(), 'audit session store 500');

        $session = AuditSession::where('code', 'SMK-AUD')->first();
        if ($session) {
            $start = $this->post("/audit-sessions/{$session->id}/start");
            $this->assertNotEquals(500, $start->getStatusCode(), 'audit start 500');
            $conduct = $this->get("/audit-sessions/{$session->id}/conduct");
            $this->assertNotEquals(500, $conduct->getStatusCode(), 'audit conduct 500');
            $cancel = $this->post("/audit-sessions/{$session->id}/cancel");
            $this->assertNotEquals(500, $cancel->getStatusCode(), 'audit cancel 500');
            $this->delete("/audit-sessions/{$session->id}");
        }
        $this->assertTrue(true);
    }

    public function test_user_management(): void
    {
        $this->admin();
        $create = $this->post('/users', [
            'name' => 'Smoke User',
            'email' => 'smokeuser@hotel.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'auditor',
        ]);
        $this->assertNotEquals(500, $create->getStatusCode(), 'user store 500');
        $user = User::where('email', 'smokeuser@hotel.com')->first();
        if ($user) {
            $upd = $this->put("/users/{$user->id}", [
                'name' => 'Smoke User 2', 'email' => 'smokeuser@hotel.com', 'role' => 'auditor',
            ]);
            $this->assertNotEquals(500, $upd->getStatusCode(), 'user update 500');
            $this->delete("/users/{$user->id}");
        }
        $this->assertTrue(true);
    }
}

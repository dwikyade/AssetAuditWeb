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
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SmokeMutationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(DatabaseSeeder::class);
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
        $dept = Department::first();
        $loc = Location::first();
        $status = AssetStatus::first();
        $cond = AssetCondition::first();

        $create = $this->post('/assets', [
            'code_mode' => 'manual',
            'asset_code' => 'AST-SMOKE-01',
            'asset_name' => 'Smoke Asset',
            'category_id' => $cat?->id,
            'department_id' => $dept?->id,
            'location_id' => $loc?->id,
            'status_id' => $status?->id,
            'condition_id' => $cond?->id,
            'quantity' => 1,
            'acquisition_value' => 500000,
            'book_value' => 500000,
        ]);
        $this->assertNotEquals(500, $create->getStatusCode(), 'asset store 500');

        $asset = Asset::where('asset_code', 'AST-SMOKE-01')->first();
        $this->assertNotNull($asset, 'asset not created');

        if ($asset) {
            $qrJson = $this->get("/assets/{$asset->id}/qr/json");
            $this->assertEquals(200, $qrJson->getStatusCode(), 'asset qr json fail');

            $regen = $this->post("/assets/{$asset->id}/qr/regenerate");
            $this->assertNotEquals(500, $regen->getStatusCode(), 'asset qr regen 500');

            $del = $this->delete("/assets/{$asset->id}");
            $this->assertNotEquals(500, $del->getStatusCode(), 'asset delete 500');
        }
    }

    public function test_export_assets_download(): void
    {
        $this->admin();
        $resp = $this->post('/export/assets');
        $this->assertNotEquals(500, $resp->getStatusCode(), 'export assets 500');
    }

    public function test_qr_bulk_export(): void
    {
        $this->admin();
        $asset = Asset::first();
        if ($asset) {
            $resp = $this->post('/export/qr-bulk', ['ids' => [$asset->id]]);
            $this->assertNotEquals(500, $resp->getStatusCode(), 'qr bulk export 500');
        } else {
            $this->assertTrue(true);
        }
    }

    public function test_import_template_download(): void
    {
        $this->admin();
        $resp = $this->get('/import/template/download');
        $this->assertNotEquals(500, $resp->getStatusCode(), 'import template download 500');
    }

    public function test_audit_session_full_flow(): void
    {
        $this->admin();
        $create = $this->post('/audit-sessions', [
            'name' => 'Session Full Flow',
            'scope_type' => 'all',
            'completion_mode' => 'flexible',
        ]);
        $this->assertNotEquals(500, $create->getStatusCode(), 'audit session store 500');

        $session = AuditSession::where('name', 'Session Full Flow')->first();
        $this->assertNotNull($session, 'audit session not created');

        if ($session) {
            $start = $this->post("/audit-sessions/{$session->id}/start");
            $this->assertNotEquals(500, $start->getStatusCode(), 'audit session start 500');

            $comp = $this->post("/audit-sessions/{$session->id}/complete");
            $this->assertNotEquals(500, $comp->getStatusCode(), 'audit session complete 500');
        }
    }

    public function test_user_management(): void
    {
        $this->admin();
        $email = 'user_smoke_' . time() . '@hotel.com';
        $create = $this->post('/users', [
            'name' => 'User Smoke',
            'email' => $email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'auditor',
        ]);
        $this->assertNotEquals(500, $create->getStatusCode(), 'user store 500');

        $usr = User::where('email', $email)->first();
        $this->assertNotNull($usr, 'user not created');

        if ($usr) {
            $del = $this->delete("/users/{$usr->id}");
            $this->assertNotEquals(500, $del->getStatusCode(), 'user delete 500');
        }
    }
}

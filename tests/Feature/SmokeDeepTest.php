<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAudit;
use App\Models\AssetCondition;
use App\Models\AuditSession;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SmokeDeepTest extends TestCase
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
        return $this->actingAs(User::where('email', 'admin@hotel.com')->first());
    }

    public function test_dashboard_loads(): void
    {
        $this->admin();
        $resp = $this->get('/');
        $this->assertNotEquals(500, $resp->getStatusCode(), 'dashboard 500');
        $this->assertContains($resp->getStatusCode(), [200], 'dashboard status');
    }

    public function test_audit_conduct_store(): void
    {
        $this->admin();
        $session = AuditSession::create([
            'name' => 'Conduct Test', 'code' => 'COND-' . time(),
            'status' => 'in_progress', 'scope_type' => 'all',
            'completion_mode' => 'flexible', 'created_by' => auth()->id(),
        ]);
        $asset = Asset::first();
        $cond = AssetCondition::first();
        if ($asset) {
            $resp = $this->post("/audit-sessions/{$session->id}/audits", [
                'asset_id' => $asset->id,
                'found_status' => 'found',
                'condition_id' => $cond?->id,
                'result' => 'match',
                'verification_method' => 'manual',
                'quantity_found' => 1,
            ]);
            $this->assertNotEquals(500, $resp->getStatusCode(), 'audit store 500: ' . $resp->status());
            $this->assertGreaterThanOrEqual(1, AssetAudit::where('audit_session_id', $session->id)->count(), 'audit not recorded');
        }
        $session->delete();
        $this->assertTrue(true);
    }

    public function test_role_management(): void
    {
        $this->admin();
        $roleName = 'SmokeRole' . time();
        $resp = $this->post('/roles', ['name' => $roleName, 'permissions' => ['asset.view']]);
        $this->assertNotEquals(500, $resp->getStatusCode(), 'role store 500');
        $role = Role::where('name', $roleName)->first();
        $this->assertNotNull($role, 'role not created');
        if ($role) {
            $upd = $this->put("/roles/{$role->id}", ['permissions' => ['asset.view', 'asset.create']]);
            $this->assertNotEquals(500, $upd->getStatusCode(), 'role update 500');
            $del = $this->delete("/roles/{$role->id}");
            $this->assertNotEquals(500, $del->getStatusCode(), 'role delete 500');
        }
        $this->assertTrue(true);
    }

    public function test_settings_update(): void
    {
        $this->admin();
        $resp = $this->post('/settings', ['settings' => ['app_name' => 'Asset Sync Test', 'currency' => 'IDR']]);
        $this->assertNotEquals(500, $resp->getStatusCode(), 'settings update 500');
        $this->assertContains($resp->getStatusCode(), [200, 302], 'settings unexpected');
    }

    public function test_activity_logs(): void
    {
        $this->admin();
        $resp = $this->get('/activity-logs');
        $this->assertNotEquals(500, $resp->getStatusCode(), 'activity logs 500');
    }

    public function test_import_upload_and_job(): void
    {
        $this->admin();
        Queue::fake();
        // Create a tiny xlsx using FastExcel
        $rows = collect([[
            'Kode' => 'IMP001', 'Barang' => 'Imported Asset', 'Lokasi' => 'Hotel',
            'Qty' => 1, 'Nilai Perolehan' => 1000000, 'Nilai Buku' => 1000000,
        ]]);
        $tmp = storage_path('app/imports/smoke_template.xlsx');
        if (!is_dir(dirname($tmp))) {
            mkdir(dirname($tmp), 0755, true);
        }
        (new \Rap2hpoutre\FastExcel\FastExcel($rows))->export($tmp);

        $resp = $this->post('/import/upload', ['file' => new \Illuminate\Http\UploadedFile($tmp, 'smoke.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true)]);
        $this->assertNotEquals(500, $resp->getStatusCode(), 'import upload 500: ' . $resp->status());
        @unlink($tmp);
        $this->assertTrue(true);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SmokeTest extends TestCase
{
    // Gunakan DB MySQL sungguhan (bukan sqlite memory) agar mirror environment produksi.
    // Kita tidak pakai RefreshDatabase untuk menghindari migrate ulang.
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['database.default' => 'mysql']);
    }

    private function loginAsAdmin()
    {
        $user = User::where('email', 'admin@hotel.com')->first();
        if (!$user) {
            $user = User::factory()->create(['email' => 'smoke@hotel.com']);
            $user->assignRole('super_admin');
        }
        return $this->actingAs($user);
    }

    public function test_all_module_endpoints(): void
    {
        $this->loginAsAdmin();

        $routes = [
            ['GET', '/'],
            ['GET', '/assets'],
            ['GET', '/assets/create'],
            ['GET', '/categories'],
            ['GET', '/departments'],
            ['GET', '/locations'],
            ['GET', '/locations/tree'],
            ['GET', '/asset-statuses'],
            ['GET', '/asset-conditions'],
            ['GET', '/asset-code-prefixes'],
            ['GET', '/audit-sessions'],
            ['GET', '/audit-sessions/create'],
            ['GET', '/reports'],
            ['GET', '/reports/asset-register'],
            ['GET', '/reports/audit'],
            ['GET', '/reports/missing'],
            ['GET', '/reports/mismatch'],
            ['GET', '/reports/condition'],
            ['GET', '/reports/department'],
            ['GET', '/reports/financial'],
            ['GET', '/import'],
            ['GET', '/import/template/download'],
            ['GET', '/import/history'],
            ['GET', '/export'],
            ['GET', '/export/qr'],
            ['GET', '/settings'],
            ['GET', '/users'],
            ['GET', '/roles'],
            ['GET', '/activity-logs'],
        ];

        $failures = [];
        foreach ($routes as [$method, $path]) {
            try {
                $response = $this->call($method, $path);
                $status = $response->getStatusCode();
                if ($status >= 500) {
                    $failures[] = "{$method} {$path} -> HTTP {$status}";
                } elseif ($status === 302 && $path !== '/') {
                    // redirect tanpa intent bisa jadi masalah auth/role
                    $failures[] = "{$method} {$path} -> HTTP 302 (redirect)";
                }
            } catch (\Throwable $e) {
                $failures[] = "{$method} {$path} -> EXCEPTION: " . get_class($e) . ': ' . $e->getMessage();
            }
        }

        if (!empty($failures)) {
            $this->fail("Smoke test failures:\n" . implode("\n", $failures));
        }

        $this->assertTrue(true);
    }
}

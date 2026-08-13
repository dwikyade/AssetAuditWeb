<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SmokeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(DatabaseSeeder::class);
    }

    private function loginAsAdmin()
    {
        $user = User::where('email', 'admin@hotel.com')->first();
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
            ['GET', '/export'],
            ['GET', '/export/qr'],
            ['GET', '/users'],
            ['GET', '/roles'],
            ['GET', '/activity-logs'],
            ['GET', '/settings'],
            ['GET', '/notifications'],
            ['GET', '/notifications/recent'],
        ];

        foreach ($routes as [$method, $uri]) {
            $resp = $this->json($method, $uri);
            $this->assertNotEquals(500, $resp->getStatusCode(), "500 Error on {$method} {$uri}");
            $this->assertContains($resp->getStatusCode(), [200, 302], "Unexpected status {$resp->getStatusCode()} on {$method} {$uri}");
        }
    }
}

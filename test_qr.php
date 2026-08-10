<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $qrSvg = SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(300)->generate('test');
    echo "SUCCESS: " . substr($qrSvg, 0, 50) . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

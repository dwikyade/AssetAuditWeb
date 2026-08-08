<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\RedirectResponse;

class QrController extends Controller
{
    /**
     * Redirect QR scan to asset detail (requires login)
     */
    public function redirect(string $token): RedirectResponse
    {
        $asset = Asset::where('qr_token', $token)->first();

        if (!$asset) {
            return redirect()->route('login')->with('error', 'QR Code tidak valid atau aset tidak ditemukan.');
        }

        // If not logged in, redirect to login then come back
        if (!auth()->check()) {
            return redirect()->route('login')->with('info', 'Silakan login untuk melihat detail aset.');
        }

        return redirect()->route('assets.show', $asset);
    }
}


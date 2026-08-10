<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Settings/Index', [
            'settings' => SystemSetting::all()->pluck('value', 'key'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($data['settings'] as $key => $value) {
            SystemSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        \Illuminate\Support\Facades\Cache::forget('system_settings');

        return back()->with('success', 'Pengaturan sistem berhasil diperbarui dan diterapkan!');
    }
}


<?php

namespace App\Http\Middleware;

use App\Models\NotificationCustom;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $settings = cache()->remember('system_settings_shared', 300, function () {
            return SystemSetting::all()->pluck('value', 'key')->toArray();
        });

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'          => $request->user()->id,
                    'name'        => $request->user()->name,
                    'email'       => $request->user()->email,
                    'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
                    'roles'       => $request->user()->getRoleNames()->toArray(),
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info'    => $request->session()->get('info'),
                'timestamp' => microtime(true),
            ],
            'app' => [
                'name' => config('app.name'),
            ],
            'settings' => $settings,
            'notificationCount' => $request->user()
                ? NotificationCustom::forUser($request->user()->id)->unread()->count()
                : 0,
        ];
    }
}


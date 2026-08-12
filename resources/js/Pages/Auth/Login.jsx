import { useForm, Head, usePage } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Button } from '@/Components/UI';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <AuthLayout>
            <Head title="Sign In" />

            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                <p className="mt-1 text-sm text-gray-500">Sign in to manage your assets and audits.</p>
            </div>

            {(flash?.error || flash?.info) && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                    <span>{flash.error || flash.info}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="admin@hotel.com"
                        required
                        autoFocus
                        autoComplete="email"
                        className={`block h-11 w-full rounded-xl border bg-gray-50 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                            errors.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'
                        }`}
                    />
                    {errors.email && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            className={`block h-11 w-full rounded-xl border bg-gray-50 px-3.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                                errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password}</p>
                    )}
                </div>

                <div className="flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                        Remember me
                    </label>
                </div>

                <Button
                    type="submit"
                    className="!h-11 w-full !rounded-xl !text-sm"
                    isLoading={processing}
                >
                    {!processing && <LogIn size={16} className="mr-2" />}
                    {processing ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>
        </AuthLayout>
    );
}

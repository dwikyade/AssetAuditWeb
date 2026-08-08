import { useForm, Head } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Input, Label, Button } from '@/Components/UI';
import { LogIn } from 'lucide-react';

export default function Login() {
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
        <AuthLayout 
            title="Masuk ke Akun Anda" 
            subtitle="Gunakan kredensial yang telah diberikan oleh administrator sistem."
        >
            <Head title="Log in" />
            
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <Label htmlFor="email">Alamat Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="admin@hotel.com"
                        error={errors.email}
                        required
                        autoFocus
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="password" className="mb-0">Kata Sandi</Label>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        error={errors.password}
                        required
                    />
                </div>

                <div className="flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                        Ingat saya
                    </label>
                </div>

                <Button 
                    type="submit" 
                    className="w-full mt-2" 
                    isLoading={processing}
                >
                    {!processing && <LogIn size={18} className="mr-2" />}
                    Masuk
                </Button>
            </form>
        </AuthLayout>
    );
}

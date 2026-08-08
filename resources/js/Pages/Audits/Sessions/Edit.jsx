import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Edit(props) {
    return (
        <AppLayout>
            <Head title="$name" />
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">$name</h1>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-500">Halaman $name sedang dalam pengembangan.</p>
                    <pre className="mt-4 p-4 bg-gray-50 rounded-lg overflow-auto text-xs">{JSON.stringify(props, null, 2)}</pre>
                </div>
            </div>
        </AppLayout>
    );
}

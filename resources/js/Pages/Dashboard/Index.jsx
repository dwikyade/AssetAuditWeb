import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Package, MapPin, Building2, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4"
    >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </motion.div>
);

export default function Dashboard({ stats }) {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Aset" 
                        value={stats.total_assets.toLocaleString()} 
                        icon={Package} 
                        colorClass="bg-blue-100 text-blue-600"
                        delay={0.1}
                    />
                    <StatCard 
                        title="Lokasi" 
                        value={stats.total_locations.toLocaleString()} 
                        icon={MapPin} 
                        colorClass="bg-indigo-100 text-indigo-600"
                        delay={0.2}
                    />
                    <StatCard 
                        title="Departemen" 
                        value={stats.total_departments.toLocaleString()} 
                        icon={Building2} 
                        colorClass="bg-purple-100 text-purple-600"
                        delay={0.3}
                    />
                    <StatCard 
                        title="Aset Diaudit (Bulan Ini)" 
                        value={stats.audited_this_month.toLocaleString()} 
                        icon={ClipboardCheck} 
                        colorClass="bg-emerald-100 text-emerald-600"
                        delay={0.4}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    {/* Recent Audits Table Placeholder */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Aktivitas Audit Terbaru</h3>
                        <div className="text-center py-12 text-gray-500">
                            <ClipboardCheck size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Data aktivitas audit akan muncul di sini</p>
                        </div>
                    </div>

                    {/* Assets by Category Placeholder */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Aset per Kategori</h3>
                        <div className="text-center py-12 text-gray-500">
                            <Package size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Grafik ringkasan aset akan muncul di sini</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

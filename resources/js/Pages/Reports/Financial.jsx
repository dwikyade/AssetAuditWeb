import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { ArrowLeft, Wallet, TrendingDown, ArrowDownRight, Package } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function FinancialReport({ summary, by_category }) {
    const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

    const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1', '#ec4899'];

    const chartData = by_category.map(item => ({
        name: item.name,
        value: parseFloat(item.book_value)
    })).filter(item => item.value > 0);

    return (
        <AppLayout>
            <Head title="Laporan Keuangan & Depresiasi" />
            
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => window.location.href = '/reports'}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Ringkasan Keuangan & Nilai Buku</h1>
                        <p className="text-sm text-gray-500">Laporan agregat nilai perolehan, depresiasi, dan sisa buku.</p>
                    </div>
                </div>

                {/* Top Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 text-black flex items-center justify-center mb-3">
                            <Wallet size={20} />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Total Nilai Perolehan</p>
                        <h3 className="text-xl font-bold text-gray-900 mt-1">{formatRp(summary.total_acquisition)}</h3>
                        <p className="text-xs text-gray-400 mt-1">Total {summary.total_assets} aset terdaftar</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-3">
                            <TrendingDown size={20} />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Akumulasi Depresiasi Berjalan</p>
                        <h3 className="text-xl font-bold text-red-700 mt-1">{formatRp(summary.total_accumulated)}</h3>
                        <p className="text-xs text-gray-400 mt-1">Total beban penyusutan sampai saat ini</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                            <ArrowDownRight size={20} />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Depresiasi Tahun Sebelumnya</p>
                        <h3 className="text-xl font-bold text-amber-700 mt-1">{formatRp(summary.total_prev_accumulated)}</h3>
                        <p className="text-xs text-gray-400 mt-1">Akumulasi dari sistem sebelumnya</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-b-4 border-b-emerald-500">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                            <Package size={20} />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Total Nilai Buku Saat Ini</p>
                        <h3 className="text-xl font-bold text-emerald-700 mt-1">{formatRp(summary.total_book_value)}</h3>
                        <p className="text-xs text-gray-400 mt-1">Nilai sisa (*Book Value*)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Data Table */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-900">Rincian Nilai per Kategori</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Kategori Aset</th>
                                        <th className="px-4 py-3 font-medium text-center">Jml Aset</th>
                                        <th className="px-4 py-3 font-medium text-right">Nilai Perolehan</th>
                                        <th className="px-4 py-3 font-medium text-right">Nilai Buku</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {by_category.map((cat, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                {cat.name}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-700">{cat.count}</td>
                                            <td className="px-4 py-3 text-right font-mono text-gray-600">{formatRp(cat.acquisition)}</td>
                                            <td className="px-4 py-3 text-right font-mono font-medium text-emerald-700">{formatRp(cat.book_value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 text-center">Komposisi Nilai Buku</h3>
                        {chartData.length > 0 ? (
                            <div className="h-64 w-full relative flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatRp(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                                Tidak ada data nilai buku
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

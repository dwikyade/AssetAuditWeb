import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { ArrowLeft, Building2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DepartmentReport({ by_department }) {
    const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

    const chartData = by_department.map(item => ({
        name: item.name,
        Jumlah_Aset: parseInt(item.count, 10),
        Nilai_Buku: parseFloat(item.total_book_value || 0)
    }));

    return (
        <AppLayout>
            <Head title="Laporan Departemen" />
            
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => window.location.href = '/reports'}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Laporan per Departemen</h1>
                            <p className="text-sm text-gray-500">Distribusi aset dan pembebanan nilai buku pada masing-masing departemen.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Data Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <Building2 size={18} className="text-gray-400" />
                            <h3 className="font-bold text-gray-900">Rincian per Departemen</h3>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Departemen</th>
                                        <th className="px-4 py-3 font-medium text-center">Jumlah Aset</th>
                                        <th className="px-4 py-3 font-medium text-right">Total Nilai Buku</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {by_department.map((dept, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{dept.name}</td>
                                            <td className="px-4 py-3 text-center text-gray-700 font-mono">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-100">
                                                    {dept.count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-medium text-emerald-700">{formatRp(dept.total_book_value)}</td>
                                        </tr>
                                    ))}
                                    {by_department.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                                                Tidak ada data departemen.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 text-center">Distribusi Jumlah Aset per Departemen</h3>
                        {chartData.length > 0 ? (
                            <div className="h-80 w-full relative flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Jumlah_Aset" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                                Tidak ada data untuk ditampilkan.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

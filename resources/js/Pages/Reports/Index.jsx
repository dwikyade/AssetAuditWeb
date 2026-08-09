import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    FileText, Package, AlertTriangle, FileWarning, 
    BarChart3, Building2, MapPin, ClipboardList, Download
} from 'lucide-react';
import { motion } from 'framer-motion';

const reportTypes = [
    {
        title: 'Register Aset',
        description: 'Daftar lengkap seluruh aset yang dimiliki beserta nilai buku dan statusnya.',
        icon: Package,
        href: '/reports/asset-register',
        color: 'bg-blue-100 text-blue-600'
    },
    {
        title: 'Laporan Audit (Stock Opname)',
        description: 'Laporan hasil pelaksanaan audit/stock opname fisik.',
        icon: ClipboardList,
        href: '/reports/audit',
        color: 'bg-indigo-100 text-indigo-600'
    },
    {
        title: 'Aset Hilang (Missing)',
        description: 'Daftar aset yang seharusnya ada namun tidak ditemukan saat audit fisik.',
        icon: FileWarning,
        href: '/reports/missing',
        color: 'bg-red-100 text-red-600'
    },
    {
        title: 'Aset Tidak Sesuai (Mismatch)',
        description: 'Daftar aset yang mengalami perpindahan lokasi atau perubahan kondisi fisik tanpa pencatatan.',
        icon: AlertTriangle,
        href: '/reports/mismatch',
        color: 'bg-amber-100 text-amber-600'
    },
    {
        title: 'Ringkasan Nilai Keuangan',
        description: 'Laporan depresiasi dan nilai sisa buku (Book Value) secara keseluruhan.',
        icon: BarChart3,
        href: '/reports/financial',
        color: 'bg-emerald-100 text-emerald-600'
    },
    {
        title: 'Laporan Kondisi Aset',
        description: 'Distribusi jumlah aset berdasarkan kategori kondisi fisik (Baik, Rusak, dll).',
        icon: FileText,
        href: '/reports/condition',
        color: 'bg-purple-100 text-purple-600'
    },
    {
        title: 'Laporan per Departemen',
        description: 'Sebaran jumlah dan nilai aset berdasarkan departemen yang menaungi.',
        icon: Building2,
        href: '/reports/department',
        color: 'bg-cyan-100 text-cyan-600'
    },
];

export default function ReportsIndex() {
    return (
        <AppLayout>
            <Head title="Laporan & Ekspor" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan & Analitik</h1>
                        <p className="text-sm text-gray-500">Pusat data laporan komprehensif terkait aset dan hasil audit hotel.</p>
                    </div>
                    <Link 
                        href="/export" 
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        <Download size={16} className="mr-2" />
                        Pusat Ekspor Data
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportTypes.map((report, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                        >
                            <div className="p-6 flex-1">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${report.color}`}>
                                    <report.icon size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{report.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{report.description}</p>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                <Link 
                                    href={report.href}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                                >
                                    Lihat Laporan
                                    <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { Download, FileSpreadsheet, ClipboardList } from 'lucide-react';
import { useState } from 'react';

export default function ExportIndex() {
    const handleExportAssets = () => {
        // POST form to trigger file download
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/export/assets';
        const csrf = document.createElement('input');
        csrf.type = 'hidden';
        csrf.name = '_token';
        csrf.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        form.appendChild(csrf);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const handleExportAudit = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/export/audit';
        const csrf = document.createElement('input');
        csrf.type = 'hidden';
        csrf.name = '_token';
        csrf.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        form.appendChild(csrf);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const exports = [
        {
            title: 'Ekspor Seluruh Data Aset',
            description: 'Unduh semua data aset dalam format Excel (.xlsx) — mencakup kode aset, nama, kategori, lokasi, nilai perolehan, nilai buku, status, dan kondisi.',
            icon: FileSpreadsheet,
            color: 'bg-emerald-100 text-emerald-600',
            action: handleExportAssets,
            label: 'Unduh Excel Aset',
        },
        {
            title: 'Ekspor Rekap Audit',
            description: 'Unduh semua data hasil audit dari seluruh sesi dalam format Excel — mencakup auditor, waktu audit, hasil temuan, kondisi, dan lokasi.',
            icon: ClipboardList,
            color: 'bg-indigo-100 text-indigo-600',
            action: handleExportAudit,
            label: 'Unduh Excel Audit',
        },
    ];

    return (
        <AppLayout>
            <Head title="Pusat Ekspor Data" />
            <div className="p-6 max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pusat Ekspor Data</h1>
                    <p className="text-sm text-gray-500">Unduh seluruh data sistem dalam format spreadsheet Excel yang siap diolah.</p>
                </div>

                <div className="space-y-4">
                    {exports.map((exp, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${exp.color}`}>
                                <exp.icon size={28} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">{exp.title}</h3>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{exp.description}</p>
                            </div>
                            <Button onClick={exp.action} className="shrink-0 whitespace-nowrap">
                                <Download size={16} className="mr-2" />
                                {exp.label}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <strong>Catatan:</strong> Proses unduhan mungkin membutuhkan beberapa detik tergantung jumlah data. 
                    Jangan tutup halaman ini selama proses berlangsung.
                </div>
            </div>
        </AppLayout>
    );
}

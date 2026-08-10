import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { ArrowLeft, User, Calendar, MapPin, Tag, CheckCircle2, AlertTriangle, XCircle, FileText, Camera } from 'lucide-react';

const Field = ({ label, value, mono }) => (
    <div>
        <dt className="text-xs font-medium text-gray-500 mb-0.5">{label}</dt>
        <dd className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value || '-'}</dd>
    </div>
);

const SectionTitle = ({ children }) => (
    <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-200 mb-4">{children}</h3>
);

export default function AuditDetail({ audit }) {
    const asset = audit.asset;
    const session = audit.audit_session;

    const foundStatusMap = {
        found:           { label: 'Ditemukan',       color: 'text-green-700',  bg: 'bg-green-50 border-green-200', icon: CheckCircle2 },
        not_found:       { label: 'Tidak Ditemukan', color: 'text-red-700',    bg: 'bg-red-50 border-red-200', icon: XCircle },
        partially_found: { label: 'Sebagian',        color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle },
    };

    const resultMap = {
        match:    { label: 'Match',    color: 'text-green-700', icon: CheckCircle2 },
        mismatch: { label: 'Mismatch', color: 'text-amber-700', icon: AlertTriangle },
        issue:    { label: 'Issue',    color: 'text-red-700', icon: XCircle },
    };

    const fs = foundStatusMap[audit.found_status] || foundStatusMap.not_found;
    const rs = resultMap[audit.result] || resultMap.issue;
    const FsIcon = fs.icon;
    const RsIcon = rs.icon;

    return (
        <AppLayout>
            <Head title={`Detail Audit: ${asset?.asset_code}`} />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/audit-sessions/${session.id}`)}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Detail Rekaman Audit</h1>
                        <p className="text-sm text-gray-500">Sesi: <span className="font-medium">{session?.name}</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hasil Audit */}
                    <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <SectionTitle>Hasil Pengecekan Fisik</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className={`p-5 rounded-xl border ${fs.bg} flex items-start gap-4`}>
                                <FsIcon size={24} className={fs.color} />
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Status Fisik Aset</p>
                                    <p className={`text-xl font-bold ${fs.color}`}>{fs.label}</p>
                                </div>
                            </div>
                            <div className={`p-5 rounded-xl border flex items-start gap-4 ${rs.label === 'Match' ? 'bg-green-50 border-green-200' : rs.label === 'Mismatch' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                                <RsIcon size={24} className={rs.color} />
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Kesimpulan Sistem</p>
                                    <p className={`text-xl font-bold ${rs.color}`}>{rs.label}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Audit */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                        <div>
                            <SectionTitle>Data Pengecekan</SectionTitle>
                            <dl className="grid grid-cols-2 gap-4">
                                <Field label="Waktu Audit" value={new Date(audit.audit_time).toLocaleString('id-ID')} />
                                <Field label="Auditor" value={audit.auditor?.name} />
                                <Field label="Metode Verifikasi" value={audit.verification_method || 'Manual'} />
                                <Field label="Qty Ditemukan" value={audit.quantity_found} />
                                <Field label="Kondisi Saat Audit" value={audit.condition?.name || '-'} />
                                <Field label="Lokasi Ditemukan" value={audit.location?.name || '-'} />
                            </dl>
                        </div>
                        {audit.notes && (
                            <div className="pt-4 border-t border-gray-100">
                                <dt className="text-xs font-medium text-gray-500 mb-1">Catatan Auditor</dt>
                                <dd className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">{audit.notes}</dd>
                            </div>
                        )}
                        {audit.photo_path && (
                            <div className="pt-4 border-t border-gray-100">
                                <dt className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2"><Camera size={14} /> Foto Bukti Audit</dt>
                                <dd>
                                    <img src={`/storage/${audit.photo_path}`} alt="Bukti Audit" className="rounded-lg border border-gray-200 w-full object-cover max-h-64" />
                                </dd>
                            </div>
                        )}
                    </div>

                    {/* Data Aset Original */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <SectionTitle>Data Master Aset</SectionTitle>
                        {asset ? (
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2 mb-2 pb-4 border-b border-gray-100">
                                    <Field label="Kode Aset" value={asset.asset_code} mono />
                                    <div className="mt-2 text-base font-bold text-gray-900">{asset.asset_name}</div>
                                </div>
                                <Field label="Kategori" value={asset.category?.name} />
                                <Field label="Departemen" value={asset.department?.name} />
                                <Field label="Lokasi Seharusnya" value={asset.location?.name} />
                                <Field label="Qty Seharusnya" value={asset.quantity} />
                                <div className="sm:col-span-2 pt-4 flex gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => router.visit(`/assets/${asset.id}`)}>
                                        Lihat Detail Aset
                                    </Button>
                                </div>
                            </dl>
                        ) : (
                            <div className="text-sm text-gray-500 italic">Data aset tidak ditemukan atau telah dihapus.</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Edit, QrCode, Package, MapPin, Building2,
    Tag, Calendar, DollarSign, Hash, Activity,
    ClipboardCheck, CheckCircle2, AlertTriangle, XCircle,
    Clock, User, Truck, Camera
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => (n ?? 0).toLocaleString('id-ID');
const fmtCurrency = (n) =>
    n != null
        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
        : '-';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('id-ID') : '-';

const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
            {Icon && <Icon size={16} className="text-black shrink-0" />}
            <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const Field = ({ label, value, mono }) => (
    <div>
        <dt className="text-xs font-medium text-gray-500 mb-0.5">{label}</dt>
        <dd className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value || '-'}</dd>
    </div>
);

const StatusBadge = ({ name, color }) => (
    <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: `${color}22`, color: color || '#6b7280', border: `1px solid ${color}44` }}
    >
        {name}
    </span>
);

const foundStatusMap = {
    found: { label: 'Ditemukan', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    not_found: { label: 'Tidak Ditemukan', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
    partially_found: { label: 'Sebagian', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
};
const resultMap = {
    match: { label: 'Match', color: 'text-green-700' },
    mismatch: { label: 'Mismatch', color: 'text-amber-700' },
    issue: { label: 'Issue', color: 'text-red-700' },
};

export default function AssetShow({ asset }) {
    const lastAudit = asset.audits?.[0];
    const auditCount = asset.audits?.length ?? 0;

    const timelineEvents = [
        ...(asset.movements ?? []).map(m => ({
            type: 'movement',
            date: m.moved_at,
            label: `Dipindahkan ke ${m.to_location?.name ?? '?'}`,
            sub: m.reason,
            icon: Truck,
            color: 'bg-blue-100 text-blue-600',
        })),
        ...(asset.audits ?? []).map(a => ({
            type: 'audit',
            date: a.audit_time,
            label: `Audit: ${resultMap[a.result]?.label ?? a.result}`,
            sub: `Kondisi: ${a.condition?.name ?? '-'} · Auditor: ${a.auditor?.name ?? '-'}`,
            icon: ClipboardCheck,
            color: 'bg-gray-100 text-black',
        })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <AppLayout>
            <Head title={`Aset: ${asset.asset_code}`} />

            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.visit('/assets')}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{asset.asset_name}</h1>
                            <p className="text-sm font-mono text-black">{asset.asset_code}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => router.visit(`/assets/${asset.id}/qr`)}>
                            <QrCode size={16} className="mr-2" />
                            QR Code
                        </Button>
                        <Button onClick={() => router.visit(`/assets/${asset.id}/edit`)}>
                            <Edit size={16} className="mr-2" />
                            Edit Aset
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Identity */}
                        <SectionCard title="Informasi Identitas" icon={Package}>
                            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                                <Field label="Kode Aset" value={asset.asset_code} mono />
                                <Field label="Nama Aset" value={asset.asset_name} />
                                <Field label="Kategori" value={asset.category?.name} />
                                <Field label="Serial Number" value={asset.serial_number} mono />
                                <Field label="Brand / Merek" value={asset.brand} />
                                <Field label="Model" value={asset.model} />
                            </dl>
                            {asset.description && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <dt className="text-xs font-medium text-gray-500 mb-1">Deskripsi</dt>
                                    <dd className="text-sm text-gray-700">{asset.description}</dd>
                                </div>
                            )}
                        </SectionCard>

                        {/* Location */}
                        <SectionCard title="Lokasi & Departemen" icon={MapPin}>
                            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                                <Field label="Departemen" value={asset.department?.name} />
                                <Field label="Lokasi" value={asset.location?.name} />
                                <Field label="Qty / Unit" value={`${fmt(asset.quantity)} ${asset.unit ?? ''}`} />
                            </dl>
                        </SectionCard>

                        {/* Accounting */}
                        <SectionCard title="Informasi Akuntansi" icon={DollarSign}>
                            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                                <Field label="Tanggal Perolehan" value={fmtDate(asset.acquisition_date)} />
                                <Field label="Tgl. Akhir Susut" value={fmtDate(asset.depreciation_end_date)} />
                                <Field label="Nilai Perolehan" value={fmtCurrency(asset.acquisition_value)} />
                                <Field label="Akum. Susut Sebelum" value={fmtCurrency(asset.previous_accumulated_depreciation)} />
                                <Field label="Akum. Susut Total" value={fmtCurrency(asset.accumulated_depreciation)} />
                                <Field label="Susut / Periode" value={fmtCurrency(asset.depreciation_per_period)} />
                                <div className="col-span-2 md:col-span-3 bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">Nilai Buku Saat Ini</span>
                                    <span className="text-xl font-bold text-gray-900">{fmtCurrency(asset.book_value)}</span>
                                </div>
                            </dl>
                        </SectionCard>

                        {/* Audit History Table */}
                        {asset.audits && asset.audits.length > 0 && (
                            <SectionCard title="Riwayat Audit" icon={ClipboardCheck}>
                                <div className="overflow-x-auto -mx-5">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-y border-gray-100">
                                            <tr>
                                                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Waktu</th>
                                                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Auditor</th>
                                                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Ditemukan</th>
                                                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Kondisi</th>
                                                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Hasil</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {asset.audits.map((a) => {
                                                const fs = foundStatusMap[a.found_status] ?? foundStatusMap.found;
                                                const rs = resultMap[a.result] ?? resultMap.match;
                                                return (
                                                    <tr key={a.id} className="hover:bg-gray-50">
                                                        <td className="px-5 py-2.5 text-gray-600 whitespace-nowrap text-xs">{fmtDateTime(a.audit_time)}</td>
                                                        <td className="px-5 py-2.5 text-gray-700">{a.auditor?.name ?? '-'}</td>
                                                        <td className="px-5 py-2.5">
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${fs.bg} ${fs.color}`}>
                                                                {fs.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-2.5 text-gray-700">{a.condition?.name ?? '-'}</td>
                                                        <td className={`px-5 py-2.5 font-medium text-xs ${rs.color}`}>{rs.label}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Status & Condition */}
                        <SectionCard title="Status & Kondisi" icon={Activity}>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Status</p>
                                    <StatusBadge name={asset.status?.name ?? '-'} color={asset.status?.color ?? '#6b7280'} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Kondisi</p>
                                    <StatusBadge name={asset.condition?.name ?? '-'} color={asset.condition?.color ?? '#6b7280'} />
                                </div>
                                {asset.notes && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Catatan</p>
                                        <p className="text-sm text-gray-700">{asset.notes}</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Audit Summary */}
                        <SectionCard title="Ringkasan Audit" icon={CheckCircle2}>
                            <dl className="space-y-3">
                                <Field label="Total Diaudit" value={`${auditCount} kali`} />
                                {lastAudit && (
                                    <>
                                        <Field label="Audit Terakhir" value={fmtDateTime(lastAudit.audit_time)} />
                                        <Field label="Auditor Terakhir" value={lastAudit.auditor?.name} />
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500 mb-1">Hasil Terakhir</dt>
                                            <dd className={`text-sm font-semibold ${resultMap[lastAudit.result]?.color ?? 'text-gray-700'}`}>
                                                {resultMap[lastAudit.result]?.label ?? lastAudit.result ?? '-'}
                                            </dd>
                                        </div>
                                    </>
                                )}
                                {!lastAudit && (
                                    <p className="text-sm text-gray-400 italic">Belum pernah diaudit.</p>
                                )}
                            </dl>
                        </SectionCard>

                        {/* QR Code */}
                        <SectionCard title="QR Code Aset" icon={QrCode}>
                            <div className="text-center space-y-3">
                                <p className="text-xs text-gray-500">Klik tombol untuk melihat QR code lengkap dan opsi cetak.</p>
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => router.visit(`/assets/${asset.id}/qr`)}
                                >
                                    <QrCode size={16} className="mr-2" />
                                    Lihat QR Code
                                </Button>
                            </div>
                        </SectionCard>

                        {/* Meta */}
                        <SectionCard title="Data Sistem" icon={Hash}>
                            <dl className="space-y-3">
                                <Field label="ID Internal" value={`#${asset.id}`} mono />
                                <Field label="Dibuat Oleh" value={asset.creator?.name} />
                                <Field label="Dibuat Pada" value={fmtDateTime(asset.created_at)} />
                                <Field label="Diperbarui" value={fmtDateTime(asset.updated_at)} />
                            </dl>
                        </SectionCard>

                        {/* Timeline */}
                        {timelineEvents.length > 0 && (
                            <SectionCard title="Timeline Perubahan" icon={Clock}>
                                <ol className="relative ml-3 border-l border-gray-200 space-y-4">
                                    {timelineEvents.slice(0, 8).map((ev, i) => {
                                        const Icon = ev.icon;
                                        return (
                                            <li key={i} className="ml-4">
                                                <div className={`absolute w-7 h-7 rounded-full -left-3.5 flex items-center justify-center ${ev.color}`}>
                                                    <Icon size={13} />
                                                </div>
                                                <p className="text-sm font-medium text-gray-800 leading-snug">{ev.label}</p>
                                                {ev.sub && <p className="text-xs text-gray-500">{ev.sub}</p>}
                                                <time className="text-xs text-gray-400">{fmtDateTime(ev.date)}</time>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </SectionCard>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

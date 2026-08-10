import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button , Select} from '@/Components/UI';
import { Save, Settings, Building2, DollarSign, ClipboardList } from 'lucide-react';

export default function SettingsIndex({ settings }) {
    const getSetting = (key, fallback = '') => settings[key]?.value ?? fallback;

    const { data, setData, post, processing } = useForm({
        settings: {
            app_name: getSetting('app_name', 'Hotel Asset Audit'),
            hotel_name: getSetting('hotel_name'),
            hotel_address: getSetting('hotel_address'),
            hotel_phone: getSetting('hotel_phone'),
            fiscal_year_start: getSetting('fiscal_year_start', '01'),
            depreciation_method: getSetting('depreciation_method', 'straight_line'),
            currency: getSetting('currency', 'IDR'),
            currency_symbol: getSetting('currency_symbol', 'Rp'),
            audit_require_photo: getSetting('audit_require_photo', 'false'),
            audit_allow_manual_entry: getSetting('audit_allow_manual_entry', 'true'),
            audit_geolocation: getSetting('audit_geolocation', 'false'),
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/settings', {
            onSuccess: () => { /* toast success already from server flash */ }
        });
    };

    const SectionHeader = ({ icon: Icon, title, description }) => (
        <div className="flex items-start gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-gray-50 text-black flex items-center justify-center shrink-0">
                <Icon size={18} />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    );

    return (
        <AppLayout>
            <Head title="Pengaturan Sistem" />
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
                    <p className="text-sm text-gray-500">Konfigurasi umum aplikasi Hotel Asset Audit.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Hotel Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <SectionHeader icon={Building2} title="Informasi Hotel" description="Data perusahaan/hotel yang tampil di laporan." />
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aplikasi</label>
                                    <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        value={data.settings.app_name} onChange={e => setData('settings', {...data.settings, app_name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Hotel</label>
                                    <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        value={data.settings.hotel_name} onChange={e => setData('settings', {...data.settings, hotel_name: e.target.value})}
                                        placeholder="contoh: Grand Hyatt Jakarta" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Hotel</label>
                                <textarea className="flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm resize-none"
                                    rows={2} value={data.settings.hotel_address} onChange={e => setData('settings', {...data.settings, hotel_address: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                                <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    value={data.settings.hotel_phone} onChange={e => setData('settings', {...data.settings, hotel_phone: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* Financial Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <SectionHeader icon={DollarSign} title="Konfigurasi Keuangan" description="Pengaturan mata uang dan metode depresiasi." />
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mata Uang</label>
                                    <Select className="flex min-h-[40px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm"
                                        value={data.settings.currency} onChange={e => setData('settings', {...data.settings, currency: e.target.value})}>
                                        <option value="IDR">IDR - Rupiah</option>
                                        <option value="USD">USD - Dollar</option>
                                        <option value="SGD">SGD - Singapore Dollar</option>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Metode Depresiasi</label>
                                    <Select className="flex min-h-[40px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm"
                                        value={data.settings.depreciation_method} onChange={e => setData('settings', {...data.settings, depreciation_method: e.target.value})}>
                                        <option value="straight_line">Garis Lurus (Straight Line)</option>
                                        <option value="declining_balance">Saldo Menurun (Declining Balance)</option>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bulan Awal Tahun Fiskal</label>
                                <Select className="flex min-h-[40px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm"
                                    value={data.settings.fiscal_year_start} onChange={e => setData('settings', {...data.settings, fiscal_year_start: e.target.value})}>
                                    {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m, i) => (
                                        <option key={i} value={String(i+1).padStart(2,'0')}>{m}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Audit Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <SectionHeader icon={ClipboardList} title="Pengaturan Audit" description="Konfigurasi perilaku proses audit fisik." />
                        <div className="space-y-4">
                            {[
                                { key: 'audit_require_photo', label: 'Foto Wajib saat Audit', desc: 'Auditor diwajibkan mengunggah foto saat mencatat aset.' },
                                { key: 'audit_allow_manual_entry', label: 'Izinkan Input Manual', desc: 'Selain scan QR, auditor boleh input kode aset secara manual.' },
                                { key: 'audit_geolocation', label: 'Aktifkan Geolokasi', desc: 'Catat koordinat GPS saat audit (memerlukan izin browser).' },
                            ].map(item => (
                                <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('settings', {...data.settings, [item.key]: data.settings[item.key] === 'true' ? 'false' : 'true'})}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
                                            ${data.settings[item.key] === 'true' ? 'bg-black' : 'bg-gray-200'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out
                                            ${data.settings[item.key] === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="submit" disabled={processing}>
                            <Save size={16} className="mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import { motion } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';

export default function AuthLayout({ children }) {
    const { app, settings } = usePage().props || {};
    const appName = app?.name || 'Asset Sync';
    const orgName = settings?.company_name || settings?.hotel_name || 'Asset Management System';

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-12"
            style={{ background: 'linear-gradient(145deg, #08090B 0%, #111318 45%, #1B1F26 100%)' }}
        >
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255,255,255,0.02) 0%, transparent 60%)',
                }}
            />

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h1v1H0z\' fill=\'%23fff\' fill-opacity=\'0.4\'/%3E%3C/svg%3E")',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Watermark overlay (Activation Style - Bottom Right) */}
            <div className="pointer-events-none fixed bottom-4 right-5 z-40 select-none text-right opacity-30">
                <p className="text-sm font-semibold tracking-wide text-gray-300">{appName}</p>
                <p className="text-xs text-gray-500">{orgName}</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-[420px]"
            >
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white font-bold text-sm text-gray-900 shadow-lg">
                        AS
                    </div>
                    <h1 className="text-lg font-bold text-white tracking-tight">{appName}</h1>
                    <p className="text-sm text-gray-500">Management System</p>
                    {orgName && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-gray-300">
                            <Building2 size={13} className="text-emerald-400 shrink-0" />
                            <span>{orgName}</span>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white p-8 shadow-2xl shadow-black/20">
                    {children}
                </div>

                <p className="mt-8 text-center text-xs text-gray-600">
                    &copy; {new Date().getFullYear()} {appName} — {orgName}
                </p>
            </motion.div>
        </div>
    );
}

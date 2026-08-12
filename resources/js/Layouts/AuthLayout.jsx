import { motion } from 'framer-motion';

export default function AuthLayout({ children }) {
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
                className="pointer-events-none absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h1v1H0z\' fill=\'%23fff\' fill-opacity=\'0.4\'/%3E%3C/svg%3E")',
                    backgroundSize: '40px 40px',
                }}
            />

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
                    <h1 className="text-lg font-bold text-white tracking-tight">Asset Sync</h1>
                    <p className="text-sm text-gray-500">Management System</p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white p-8 shadow-2xl shadow-black/20">
                    {children}
                </div>

                <p className="mt-8 text-center text-xs text-gray-600">
                    &copy; {new Date().getFullYear()} Asset Sync Management System
                </p>
            </motion.div>
        </div>
    );
}

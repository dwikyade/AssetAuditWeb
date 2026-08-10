import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
            {/* Left pane - Image/Brand */}
            <div className="hidden md:flex flex-1 flex-col justify-between bg-black p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Hotel Asset Audit</h1>
                        <p className="text-gray-400 text-sm font-medium">Management System</p>
                    </div>
                </div>

                <div className="relative z-10 max-w-md">
                    <h2 className="text-3xl font-bold mb-4">Solusi Terpadu Manajemen Aset</h2>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Kelola, lacak, dan audit seluruh aset hotel dengan mudah, akurat, dan real-time.
                    </p>
                </div>

                <div className="relative z-10 text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Hotel Asset Audit System.
                </div>
            </div>

            {/* Right pane - Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    <div className="md:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Hotel Asset Audit</h1>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                        {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
                    </div>

                    {children}
                </motion.div>
            </div>
        </div>
    );
}

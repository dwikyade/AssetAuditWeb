const fs = require('fs');

const uiFile = 'C:\\Develop\\auditassetweb\\resources\\js\\Components\\UI.jsx';
let uiContent = fs.readFileSync(uiFile, 'utf8');

// 1. Update Input to be modern
uiContent = uiContent.replace(
    /"flex h-9 w-full rounded-sm border border-gray-300 bg-white px-2.5 py-1.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"/,
    '"flex h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm"'
);

// 2. Add Select and Textarea
if (!uiContent.includes('export const Select')) {
    const selectTextareaCode = `
export const Select = forwardRef(({ className, error, children, ...props }, ref) => {
    return (
        <div className="relative w-full">
            <select
                className={cn(
                    "flex h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm appearance-none",
                    error && "border-red-500 focus:ring-red-500",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
});
Select.displayName = 'Select';

export const Textarea = forwardRef(({ className, error, ...props }, ref) => {
    return (
        <div className="relative w-full">
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm",
                    error && "border-red-500 focus:ring-red-500",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
});
Textarea.displayName = 'Textarea';
`;
    // Insert before export const Label
    uiContent = uiContent.replace('export const Label', selectTextareaCode + '\nexport const Label');
}
fs.writeFileSync(uiFile, uiContent);
console.log('UI.jsx modernized');

// 3. Modernize AppLayout toasts
const appLayoutFile = 'C:\\Develop\\auditassetweb\\resources\\js\\Layouts\\AppLayout.jsx';
let layoutContent = fs.readFileSync(appLayoutFile, 'utf8');

// The toasts currently look like:
/*
<motion.div
    key={toast.id}
    initial={{ opacity: 0, x: 100, scale: 0.9 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 100, scale: 0.9 }}
    className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm max-w-sm',
        toast.type === 'success' && 'bg-green-50 text-green-800 border border-green-200',
        toast.type === 'error' && 'bg-red-50 text-red-800 border border-red-200',
        toast.type === 'warning' && 'bg-yellow-50 text-yellow-800 border border-yellow-200',
        toast.type === 'info' && 'bg-blue-50 text-blue-800 border border-blue-200',
    )}
>
*/
layoutContent = layoutContent.replace(
    /initial={{ opacity: 0, x: 100, scale: 0.9 }}[\s\S]*?toast\.type === 'info'[^)]*\),?\n\s*\)}/g,
    `initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            transition={{ type: 'spring', bounce: 0.3 }}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl text-sm min-w-[300px] border',
                                toast.type === 'success' && 'bg-gray-900 text-white border-gray-800',
                                toast.type === 'error' && 'bg-red-600 text-white border-red-700',
                                toast.type === 'warning' && 'bg-yellow-500 text-white border-yellow-600',
                                toast.type === 'info' && 'bg-blue-600 text-white border-blue-700',
                            )}`
);

// We need to move the toast container from bottom-right to top-center
layoutContent = layoutContent.replace(
    /<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">/g,
    '<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">\n                {/* Need to add pointer-events-auto to the children */}'
);

layoutContent = layoutContent.replace(
    /<span className="flex-1">{toast\.msg}<\/span>/g,
    '<div className="flex-1 flex items-center gap-2 pointer-events-auto">\n                                {toast.type === "success" && <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}\n                                {toast.type === "error" && <svg className="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}\n                                <span className="font-medium tracking-wide">{toast.msg}</span>\n                            </div>'
);
layoutContent = layoutContent.replace(
    /<button onClick={\(\) => dismissToast\(toast\.id\)} className="text-gray-400 hover:text-gray-600 shrink-0">×<\/button>/g,
    '<button onClick={() => dismissToast(toast.id)} className="text-gray-400 hover:text-white shrink-0 pointer-events-auto ml-2"><X size={16} /></button>'
);

// Import X from lucide-react if not present, wait it's already there? No, AppLayout imports layout icons. Let's add X if not present.
if (!layoutContent.includes('X, ') && !layoutContent.includes(', X')) {
    layoutContent = layoutContent.replace('Activity, Shield', 'Activity, Shield, X');
}

fs.writeFileSync(appLayoutFile, layoutContent);
console.log('AppLayout toasts modernized');

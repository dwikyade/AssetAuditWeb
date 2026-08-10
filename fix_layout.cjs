const fs = require('fs');

const file = 'C:\\Develop\\auditassetweb\\resources\\js\\Layouts\\AppLayout.jsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Role format
c = c.replace(
  "import { cn, getInitials } from '@/lib/utils';",
  "import { cn, getInitials, formatRole } from '@/lib/utils';"
);
c = c.replace(
  "<p className=\"text-xs truncate\" style={{ color: 'var(--color-sidebar-text)' }}>{user?.roles?.[0]}</p>",
  "<p className=\"text-xs truncate\" style={{ color: 'var(--color-sidebar-text)' }}>{user?.roles?.[0] ? formatRole(user.roles[0]) : ''}</p>"
);

// 2. Sidebar styling
c = c.replace(
  'className="flex flex-col flex-shrink-0 h-full"\n                style={{ backgroundColor: \'var(--color-sidebar-bg)\' }}',
  'className="flex flex-col flex-shrink-0 h-full rounded-r-[1.5rem] shadow-xl bg-gradient-to-b from-gray-950 to-gray-800"'
);

// 3. Topbar styling
c = c.replace(
  '<header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">',
  '<header className="h-14 bg-gray-950 border-b border-gray-800 shadow-sm flex items-center justify-between px-6 shrink-0">'
);
c = c.replace(
  '<nav className="flex items-center text-sm text-gray-500">',
  '<nav className="flex items-center text-sm text-gray-400">'
);
c = c.replace(
  '<Link href="/" className="hover:text-gray-700">Home</Link>',
  '<Link href="/" className="hover:text-white transition-colors">Home</Link>'
);
c = c.replace(
  '<button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">',
  '<button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">'
);
c = c.replace(
  '<div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-semibold">',
  '<div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white text-xs font-semibold">'
);
c = c.replace(
  '<span className="text-sm font-medium text-gray-700">{user?.name}</span>',
  '<span className="text-sm font-medium text-gray-200">{user?.name}</span>'
);

fs.writeFileSync(file, c);
console.log("AppLayout.jsx updated.");

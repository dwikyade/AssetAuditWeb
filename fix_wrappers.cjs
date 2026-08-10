const fs = require('fs');

const filesToFix = [
  'resources/js/Pages/ActivityLogs/Index.jsx',
  'resources/js/Pages/Audits/Sessions/Index.jsx',
  'resources/js/Pages/Categories/Index.jsx',
  'resources/js/Pages/Departments/Index.jsx',
  'resources/js/Pages/Import/Index.jsx',
  'resources/js/Pages/Import/Show.jsx',
  'resources/js/Pages/Locations/Index.jsx',
  'resources/js/Pages/Reports/Mismatch.jsx',
  'resources/js/Pages/Users/Index.jsx',
  'resources/js/Pages/Audits/Conduct.jsx'
];

filesToFix.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Replace "p-6 md:p-8 w-full space-y-4" or similar with the standard one
    content = content.replace(/className=["']p-6 md:p-8 w-full( space-y-[0-9]+)?["']/g, 'className="p-6 lg:p-8 w-full max-w-7xl mx-auto$1"');
    content = content.replace(/className=["']p-4 md:p-4 w-full( space-y-[0-9]+)?["']/g, 'className="p-6 lg:p-8 w-full max-w-7xl mx-auto$1"');
    
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Fixed ${f}`);
  }
});

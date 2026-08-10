const fs = require('fs');

const files = [
  'resources/js/Pages/Users/Index.jsx',
  'resources/js/Pages/Statuses/Index.jsx',
  'resources/js/Pages/Roles/Index.jsx',
  'resources/js/Pages/Locations/Index.jsx',
  'resources/js/Pages/Departments/Index.jsx',
  'resources/js/Pages/Conditions/Index.jsx',
  'resources/js/Pages/Categories/Index.jsx',
  'resources/js/Pages/Audits/Sessions/Show.jsx',
  'resources/js/Pages/Assets/Qr.jsx',
  'resources/js/Pages/Assets/Index.jsx',
  'resources/js/Pages/AssetCodes/Index.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    
    if (c.includes('confirm(')) {
      // 1. replace confirm( with await window.confirmUI(
      c = c.replace(/confirm\(/g, 'await window.confirmUI(');
      
      // 2. Make the containing function async
      // This regex matches "const name = (args) => {" and makes it async
      c = c.replace(/(const\s+\w+\s*=\s*)(\([^)]*\))(\s*=>\s*\{)/g, (match, p1, p2, p3) => {
          // If the function already has async, don't add it again
          if (p1.includes('async')) return match;
          return p1 + 'async ' + p2 + p3;
      });
      
      fs.writeFileSync(f, c);
      console.log("Updated", f);
    }
  }
});

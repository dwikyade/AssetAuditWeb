const fs = require('fs');

const files = {
  'resources/js/Pages/Assets/Create.jsx': 'max-w-4xl mx-auto',
  'resources/js/Pages/Assets/Edit.jsx': 'max-w-4xl mx-auto',
  'resources/js/Pages/Audits/Sessions/Create.jsx': 'max-w-3xl mx-auto',
  'resources/js/Pages/Audits/Sessions/Edit.jsx': 'max-w-3xl mx-auto',
  'resources/js/Pages/Users/Create.jsx': 'max-w-3xl mx-auto',
  'resources/js/Pages/Users/Edit.jsx': 'max-w-3xl mx-auto',
  'resources/js/Pages/AssetCodes/Create.jsx': 'max-w-2xl mx-auto',
  'resources/js/Pages/AssetCodes/Edit.jsx': 'max-w-2xl mx-auto',
};

for (const [file, widthClass] of Object.entries(files)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/className="p-4 w-full( space-y-[0-9]+)?"/, `className="p-4 w-full ${widthClass}$1"`);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

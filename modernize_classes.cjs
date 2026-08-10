const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const pagesDir = path.join(__dirname, 'resources', 'js', 'Pages');

walkDir(pagesDir, (filePath) => {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // Old standard input class
        // "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        const oldClass1 = /w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white/g;
        const newClass1 = "flex min-h-[40px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm";
        if (content.match(oldClass1)) {
            content = content.replace(oldClass1, newClass1);
            updated = true;
        }

        // Dynamic classes like in Assets/Create.jsx
        // `flex h-10 w-full rounded-md border ${...} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900`
        const oldClass2 = /flex h-10 w-full rounded-md border (\$\{[^}]+\}) bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900/g;
        const newClass2 = "flex h-10 w-full rounded-xl border $1 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm";
        if (content.match(oldClass2)) {
            content = content.replace(oldClass2, newClass2);
            updated = true;
        }

        // Textarea in Settings/Index.jsx
        const oldClass3 = /w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none/g;
        const newClass3 = "flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm resize-none";
        if (content.match(oldClass3)) {
            content = content.replace(oldClass3, newClass3);
            updated = true;
        }

        // Dashboard select
        // className="rounded-md border border-gray-300 text-sm focus:ring-gray-900 focus:border-gray-900"
        const oldClass4 = /rounded-md border border-gray-300 text-sm focus:ring-gray-900 focus:border-gray-900/g;
        const newClass4 = "rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm";
        if (content.match(oldClass4)) {
            content = content.replace(oldClass4, newClass4);
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated classes in ${filePath}`);
        }
    }
});

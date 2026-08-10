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
let updatedFiles = [];

walkDir(pagesDir, (filePath) => {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // Replace 'rounded-md' with 'rounded-xl', 'border-gray-300' with 'border-gray-200 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white'
        // But only on `<select>` and `<textarea>` tags.
        // Actually, we can just replace 'rounded-md border border-gray-300' everywhere inside <select> and <textarea>.

        const replaceInTag = (tag) => {
            const regex = new RegExp(`<${tag}[^>]*className=["'][^"']*["'][^>]*>`, 'g');
            content = content.replace(regex, (match) => {
                let newMatch = match;
                newMatch = newMatch.replace('rounded-md', 'rounded-xl');
                newMatch = newMatch.replace('border-gray-300', 'border-gray-200 bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm');
                if (newMatch !== match) updated = true;
                return newMatch;
            });
        };

        replaceInTag('select');
        replaceInTag('textarea');

        // Also fix dynamic classes in Create.jsx
        // `className={\`flex h-10 w-full rounded-md border \${errors.prefix_id ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900\`}`
        const dynamicRegex = /<select[^>]*className=\{`[^`]+`\}[^>]*>/g;
        content = content.replace(dynamicRegex, (match) => {
            let newMatch = match;
            newMatch = newMatch.replace('rounded-md', 'rounded-xl');
            newMatch = newMatch.replace('border-gray-300', 'border-gray-200');
            newMatch = newMatch.replace('bg-white', 'bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm');
            if (newMatch !== match) updated = true;
            return newMatch;
        });

        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            updatedFiles.push(filePath);
        }
    }
});

console.log('Updated: ' + updatedFiles.length + ' files');

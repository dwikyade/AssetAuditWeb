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

        if (content.includes('<select')) {
            content = content.replace(/<select/g, '<Select');
            content = content.replace(/<\/select>/g, '</Select>');
            
            // Check if Select is imported from UI.jsx
            if (!content.includes('Select') || (!content.includes('import {') && !content.includes('@/Components/UI'))) {
                // If there's an existing UI import
                if (content.match(/import\s+\{[^}]+\}\s+from\s+['"]@\/Components\/UI['"]/)) {
                    content = content.replace(/(import\s+\{[^}]+)\}(\s+from\s+['"]@\/Components\/UI['"])/, (match, p1, p2) => {
                        if (!p1.includes('Select')) {
                            return p1 + ', Select}' + p2;
                        }
                        return match;
                    });
                } else {
                    // add import at the top
                    content = "import { Select } from '@/Components/UI';\n" + content;
                }
            } else if (content.match(/import\s+\{[^}]+\}\s+from\s+['"]@\/Components\/UI['"]/)) {
                content = content.replace(/(import\s+\{[^}]+)\}(\s+from\s+['"]@\/Components\/UI['"])/, (match, p1, p2) => {
                    if (!p1.includes('Select')) {
                        return p1 + ', Select}' + p2;
                    }
                    return match;
                });
            }
            
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            updatedFiles.push(filePath);
        }
    }
});

console.log('Replaced selects in: ' + updatedFiles.length + ' files');

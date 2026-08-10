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
        const content = fs.readFileSync(filePath, 'utf8');
        // Find the first <div className="..."> that comes after AppLayout or Head
        const match = content.match(/<AppLayout>[\s\S]*?<Head[^>]*>[\s\S]*?<div\s+className=["']([^"']+)["']/);
        if (match) {
            console.log(filePath.replace(pagesDir, ''), '=>', match[1]);
        }
    }
});

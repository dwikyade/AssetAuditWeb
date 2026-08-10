const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('resources/js/Pages', function(filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        
        // 1. Widen containers and tighten spacing
        // Replace something like "p-6 max-w-4xl mx-auto space-y-6"
        newContent = newContent.replace(/max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|md)\s+mx-auto\s+/g, 'w-full ');
        newContent = newContent.replace(/p-6\s+w-full/g, 'p-4 w-full');
        newContent = newContent.replace(/space-y-6/g, 'space-y-4');
        newContent = newContent.replace(/space-y-8/g, 'space-y-6');

        // 2. Replace indigo with monochrome equivalents
        newContent = newContent.replace(/indigo-50(?![0-9])/g, 'gray-50');
        newContent = newContent.replace(/indigo-100/g, 'gray-100');
        newContent = newContent.replace(/indigo-200/g, 'gray-200');
        newContent = newContent.replace(/indigo-300/g, 'gray-300');
        newContent = newContent.replace(/indigo-400/g, 'gray-400');
        newContent = newContent.replace(/indigo-500/g, 'gray-900');
        newContent = newContent.replace(/indigo-600/g, 'black');
        newContent = newContent.replace(/indigo-700/g, 'gray-900');
        newContent = newContent.replace(/indigo-800/g, 'black');
        newContent = newContent.replace(/indigo-900/g, 'black');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated', filePath);
        }
    }
});

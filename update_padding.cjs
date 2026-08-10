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

        // Replace for Index pages which typically just have `p-4 w-full space-y-4` or `p-4 w-full`
        // Ensure we don't mess up ones that already have max-w-* like max-w-4xl
        if (!content.includes('max-w-') && (content.includes('className="p-4 w-full') || content.includes("className='p-4 w-full"))) {
            content = content.replace(/className=(['"])p-4 w-full/g, 'className=$1p-6 lg:p-8 w-full max-w-7xl mx-auto');
            updated = true;
        } 
        // If it already has max-w-*, maybe just increase padding from p-4 to p-6 md:p-8
        else if (content.includes('max-w-') && content.match(/className=(['"])p-4 w-full/)) {
            content = content.replace(/className=(['"])p-4 w-full/g, 'className=$1p-6 md:p-8 w-full');
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated padding in ${filePath}`);
        }
    }
});

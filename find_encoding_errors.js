const fs = require('fs');
const path = require('path');

const targetDir = process.cwd();
const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.idea', '.vscode', 'public', 'assets', 'uploads'];
const badChars = ['\uFFFD', 'Ã©', 'Ã¨', 'Ã', 'Ã§', 'Ã®', 'Ã´', 'Ã»', 'Ã¢', 'Ãª', 'Ã«', 'Ã¯'];

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!excludeDirs.includes(file)) {
                scanDir(fullPath);
            }
        } else {
            if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.html') || fullPath.endsWith('.css')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                let foundBad = false;
                for (const badChar of badChars) {
                    if (content.includes(badChar)) {
                        console.log(`Found anomally (${badChar}) in: ${fullPath}`);
                        foundBad = true;
                        break;
                    }
                }
            }
        }
    }
}

console.log('Starting scan...');
scanDir(targetDir);
console.log('Scan complete.');

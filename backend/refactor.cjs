const fs = require('fs');
const path = require('path');

function replaceInFolder(dir, apiImportPath) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInFolder(fullPath, apiImportPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            if (fullPath.includes('api.js') && fullPath.includes('services')) continue;
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('http://localhost:5000/api')) {
                const apiFile = path.resolve(dir.split('src')[0], 'src/services/api');
                let relPath = path.relative(path.dirname(fullPath), apiFile).replace(/\\/g, '/');
                if (!relPath.startsWith('.')) relPath = './' + relPath;
                
                content = content.replace(/http:\/\/localhost:5000\/api/g, '${API_BASE_URL}');
                content = content.replace(/'([^']*\$\{API_BASE_URL\}[^']*)'/g, '`$1`');
                
                const lines = content.split('\n');
                let lastImport = -1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('import ')) lastImport = i;
                }
                
                lines.splice(lastImport + 1, 0, `import { API_BASE_URL } from '${relPath}';`);
                fs.writeFileSync(fullPath, lines.join('\n'));
                console.log('Updated ' + fullPath);
            }
        }
    }
}

replaceInFolder(path.resolve('../admin-portal/src'));
replaceInFolder(path.resolve('../user-portal/src'));

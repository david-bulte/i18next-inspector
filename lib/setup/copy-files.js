const fs = require('fs');

const sourceFile = 'lib/setup/locize-sync-config-template.json';
const targetFile = process.env.INIT_CWD + '/locize-sync-config.json';

if (!fs.exists(targetFile)) {
    fs.copyFile(sourceFile, targetFile, (err) => {
        if (err) throw err;
        console.log('created file ', targetFile);
    });
}

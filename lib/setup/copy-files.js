/**
 * Creates a config file in the project folder.
 */

const fs = require('fs');

const sourceFile = 'lib/setup/i18next-inspector-config-template.json';
const targetFile = process.env.INIT_CWD + '/i18next-inspector-config.json';

fs.exists(targetFile, exists => {
    if (!exists) {
        fs.copyFile(sourceFile, targetFile, (err) => {
            if (err) throw err;
            console.log('created file ', targetFile);
        });
    }
});

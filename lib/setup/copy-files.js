const fs = require('fs');

// destination.txt will be created or overwritten by default.
fs.copyFile('locize-sync-config-template.json', 'locize-sync-config.json', (err) => {
    if (err) throw err;
    console.log('source.txt was copied to destination.txt');
});

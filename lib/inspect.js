var findInFiles = require('find-in-files');

const regexes = {
    angular: {
        // cf. https://regexr.com/4vdqa
        i18nextPipe: /'([a-zA-Z0-9]*[:]?[a-zA-Z0-9 .]*)'[ ]*\|[ ]*i18next/
    }
}

module.exports = {

    findKeys: (dirname) => {

        console.debug('findKeys', dirname);

        return new Promise((resolve, reject) => {

            // in html
            const regex = /'([a-zA-Z0-9]*[:]?[a-zA-Z0-9_.]*)'[ ]*\|[ ]*i18next/;

            findInFiles.find(regex, dirname, '.html')
                .then(function(results) {
                    const keys = [];
                    for (const fileResult of Object.values(results)) {
                        for (const match of fileResult.matches) {
                            let gr = regex.exec(match)[1];
                            keys.push(gr);
                        }
                    }

                    console.debug('findKeys - result:', dirname);

                    resolve(keys);

                });

        });


    }
}
;






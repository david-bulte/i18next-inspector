var findInFiles = require('find-in-files');

let config;

// cf. https://regexr.com/4vdqa
const defaultRegexes = {
    angular: {
        i18nextPipe: /'([a-zA-Z0-9]*[:]?[a-zA-Z0-9_.]*)'[ ]*\|[ ]*i18next/
    }
}

module.exports = {

    init: ({grep}) => {
        config = grep;
    },

    findKeys: (dirname) => {

        console.debug('findKeys', dirname);

        return new Promise((resolve, reject) => {

            // in html
            // const regex = /'([a-zA-Z0-9]*[:]?[a-zA-Z0-9_.]*)'[ ]*\|[ ]*i18next/;
            // todo get from config
            const regexes = getRegexes();

            for (regex of regexes) {
                findInFiles.find(regex, dirname, '.html')
                    .then(function (results) {
                        const keys = [];
                        for (const fileResult of Object.values(results)) {
                            for (const match of fileResult.matches) {
                                let gr = regex.exec(match)[1];
                                keys.push(gr);
                            }
                        }

                        console.debug('findKeys - result:', keys);

                        resolve(keys);
                    });
            }

        });


    }
}
;

function getRegexes() {
    const frameworkRegexes = (config.framework && defaultRegexes[config.framework] && Object.values(defaultRegexes[config.framework])) || [];
    const additionalRegexes = config.additionalRegexes || [];
    return [...frameworkRegexes, ...additionalRegexes];
}




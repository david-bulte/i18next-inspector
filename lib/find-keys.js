const clui = require('clui');
const findInFiles = require('find-in-files');
const logger = require('./logger');

const findKeys = exports;
findKeys.config = {};

findKeys.find = (dirname) => {

    logger.debug('FindKeys - dirname = ', dirname);
    const spinner = new clui.Spinner('Finding keys...');
    spinner.start();

    return new Promise((resolve, reject) => {

        const regexes = getRegexes(findKeys.config);
        logger.debug('FindKeys - regexes = ', regexes);

        const keys = [];

        const searches = regexes.map(regex => {
            return findInFiles.find(regex.regex, dirname, regex.fileExtensions)
                .then(function (results) {
                    for (const fileResult of Object.values(results)) {
                        try {
                            for (const match of fileResult.matches) {
                                let gr = regex.regex.exec(match)[1];
                                keys.push(gr);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                });
        })

        Promise.all(searches).then(() => {
            logger.debug('FindKeys - result = ', keys);
            spinner.stop();
            resolve(new Set(keys));
        });
    });

}

function getRegexes(config) {
    const frameworkRegexes = config.regexes || [];
    const additionalRegexes = config.additionalRegexes || [];
    return [...frameworkRegexes, ...additionalRegexes].map(regexConfig => {
        return {...regexConfig, regex: new RegExp(regexConfig.regex.substr(1, regexConfig.regex.length - 2))}
    });
}

const clui = require('clui');
const findInFiles = require('find-in-files');
const logger = require('./logger');

const findKeys = exports;
findKeys.config = {framework: 'angular'};

findKeys.find = (dirname) => {

    logger.debug('findKeys - dirname = ', dirname);
    const spinner = new clui.Spinner('Finding keys...');
    spinner.start();

    return new Promise((resolve, reject) => {

        const regexes = getRegexes(findKeys.config);
        logger.debug('findKeys - regexes = ', regexes);

        const keys = [];

        const searches = regexes.map(regex => {
            return findInFiles.find(regex.regex, dirname, regex.fileExtension)
                .then(function (results) {
                    for (const fileResult of Object.values(results)) {
                        for (const match of fileResult.matches) {
                            let gr = regex.regex.exec(match)[1];
                            keys.push(gr);
                        }
                    }
                });
        })

        Promise.all(searches).then(() => {
            logger.debug('findKeys - result = ', keys);
            spinner.stop();
            resolve(keys);
        });
    });

}

function getRegexes(config) {
    const frameworkRegexes = (config.framework && defaultRegexes[config.framework] && Object.values(defaultRegexes[config.framework])) || [];
    const additionalRegexes = config.additionalRegexes || [];
    return [...frameworkRegexes, ...additionalRegexes];
}

// cf. https://regexr.com/4vdqa
const defaultRegexes = {
    angular: [{
        regex: /'([a-zA-Z0-9]*[:]?[a-zA-Z0-9_.]*)'[ ]*\|[ ]*i18next/,   // i18NextPipe
        fileExtension: '.html'
    }]
}


// // const inspector = exports;
//
// const inspector = {}
//
// inspector.config = {}
//
// inspector.findKeys = (dirname) => {
//
//     logger.debug('findKeys', dirname);
//
//     return new Promise((resolve, reject) => {
//
//         // in html
//         const regex = /'([a-zA-Z0-9]*[:]?[a-zA-Z0-9_.]*)'[ ]*\|[ ]*i18next/;
//         // todo get from config
//         const regexes = getRegexes();
//
//         // for (regex of regexes) {
//         findInFiles.find(regex, dirname, '.html')
//             .then(function (results) {
//                 const keys = [];
//                 for (const fileResult of Object.values(results)) {
//                     for (const match of fileResult.matches) {
//                         let gr = regex.exec(match)[1];
//                         keys.push(gr);
//                     }
//                 }
//
//                 logger.debug('findKeys - result:', keys);
//
//                 resolve(keys);
//             });
//         // }
//
//     });
//
//
// };


// module.exports = {
//
//     init: _config => {
//         config = _config.grep;
//     },
//
//     find: (dirname) => {
//
//         logger.debug('find', dirname);
//
//         return new Promise((resolve, reject) => {
//
//             // in html
//             const regex = /'([a-zA-Z0-9]*[:]?[a-zA-Z0-9_.]*)'[ ]*\|[ ]*i18next/;
//             // todo get from config
//             const regexes = getRegexes();
//
//             // for (regex of regexes) {
//                 findInFiles.find(regex, dirname, '.html')
//                     .then(function (results) {
//                         const keys = [];
//                         for (const fileResult of Object.values(results)) {
//                             for (const match of fileResult.matches) {
//                                 let gr = regex.exec(match)[1];
//                                 keys.push(gr);
//                             }
//                         }
//
//                         logger.debug('findKeys - result:', keys);
//
//                         resolve(keys);
//                     });
//             // }
//
//         });
//
//
//     }
// }
// ;

const https = require('https');
const rp = require('request-promise');
const clui = require('clui');
const logger = require('./logger');

var _config;

module.exports = {

    set config(config) {
        _config = config;
    },

    fetchAvailableLanguages: () => {

        let langs = _config.langs;
        if (_config.langs && langs.length > 0) {
            logger.debug('fetchAvailableLanguages - langs have been configured, no need to fetch from locize', langs);
            return Promise.resolve(langs.reduce((res, curr) => {
                return {...res, [curr]: {name: curr}};
            }, {}))
        }

        const spinner = new clui.Spinner('Fetching langs...');
        spinner.start();

        let options = {
            uri: `https://api.locize.app/languages/${_config.projectId}`,
            headers: {
                'Authorization': `Bearer ${_config.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            json: true
        };

        logger.debug('fetchAvailableLanguages - options', options);

        return rp(options).then(_langs => {
            logger.debug('fetchAvailableLanguages success', _langs);
            spinner.stop();
            return _langs;
        }, err => {
            logger.error('fetchAvailableLanguages error', err);
            spinner.stop();
            return {};
        });
    },

    fetchNamespaceResources: lang => {

        let options = {
            uri: `https://api.locize.app/private/${_config.projectId}/latest/${lang}/common`,
            headers: {
                'Authorization': `Bearer ${_config.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            json: true
        };

        return rp(options).then(resources => {
            logger.debug(`fetchNamespaceResources for ${lang} success`, resources);
            return resources;
        }, err => {
            logger.error('fetchNamespaceResources error', err)
            return [];
        });
    },

    addMissingTranslations: (lang, body) => {

        logger.debug('addMissingTranslations ', body);

        let options = {
            method: 'POST',
            uri: `https://api.locize.app/missing/${_config.projectId}/latest/${lang}/common`,
            body,
            headers: {
                'Authorization': `Bearer ${_config.apiKey}`
            },
            json: true
        };

        return rp(options).then(_ => {
            logger.debug('addMissingTranslations success', lang);
            return true;
        }, err => {
            logger.error('addMissingTranslations error', err);
            return false;
        });

    },

    updateRemoveTranslations: () => {

        let options = {
            method: 'POST',
            uri: `https://api.locize.app/update/${_config.projectId}/latest/en/common`,
            qs: {
                replace: false
            },
            body: {
                catwoman: null,
                joker: 'joker'
            },
            headers: {
                'Authorization': `Bearer ${_config.apiKey}`
            },
            json: true
        };

        // let data = JSON.stringify({
        //     catwoman: null,
        //     joker: 'joker'
        // })
        //
        // options = {
        //     protocol: 'https:',
        //     hostname: 'api.locize.app',
        //     path: '/update/91f83f9c-6bd3-4dc5-ba89-17772ead95e9/latest/en/common?replace=false',
        //     method: 'POST',
        //     headers: {
        //         'Authorization': 'Bearer 701dec07-c239-4a50-98a0-3e1cd78406dc',
        //         'Content-Type': 'application/json',
        //         'Content-Length': data.length,
        //         'Accept': 'application/json'
        //     }
        // }
        //
        // let options = {
        //     method: 'POST',
        //     uri: '/update/91f83f9c-6bd3-4dc5-ba89-17772ead95e9/latest/en/common',
        //     qs: {
        //         replace: false
        //     },
        //     body: {
        //         'Authorization': 'Bearer 701dec07-c239-4a50-98a0-3e1cd78406dc',
        //         'Content-Type': 'application/json',
        //         'Content-Length': data.length,
        //         'Accept': 'application/json'
        //     },
        //     json: true // Automatically stringifies the body to JSON
        // };

        return rp(options);

        // const req = https.request(options, res => {
        //     console.log(`statusCode: ${res.statusCode}`)
        //
        //     res.on('data', d => {
        //         process.stdout.write(d)
        //     })
        // })
        //
        // req.on('error', error => {
        //     console.error(error)
        // })
        //
        // console.log('sending', data);
        // req.write(data)
        // req.end()

    }
}
;






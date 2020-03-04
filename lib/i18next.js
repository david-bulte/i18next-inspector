const https = require('https');
const rp = require('request-promise');

var config;

module.exports = {

    init: ({projectId, apiKey}) => {
        config = {projectId, apiKey};
    },

    fetchNamespaceResources: lang => {

        console.debug('fetchNamespaceResources', lang);

        let options = {
            uri: `https://api.locize.app/private/${config.projectId}/latest/${lang}/common`,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            json: true
        };

        return rp(options);
    },

    fetchAvailableLanguages: () => {

        console.debug('fetchAvailableLanguages');

        let options = {
            uri: `https://api.locize.app/languages/${config.projectId}`,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            json: true
        };

        return rp(options);
    },

    addMissingTranslations: (lang, body) => {

        console.debug('addMissingTranslations ', body);

        let options = {
            method: 'POST',
            uri: `https://api.locize.app/missing/${config.projectId}/latest/${lang}/common`,
            body,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`
            },
            json: true // Automatically stringifies the body to JSON
        };

        return rp(options);

    },

    updateRemoveTranslations: () => {

        console.debug('updateRemoveTranslations');

        let options = {
            method: 'POST',
            uri: `https://api.locize.app/update/${config.projectId}/latest/en/common`,
            qs: {
                replace: false
            },
            body: {
                catwoman: null,
                joker: 'joker'
            },
            headers: {
                'Authorization': `Bearer ${config.apiKey}`
            },
            json: true // Automatically stringifies the body to JSON
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






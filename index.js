// chalk — colorizes the output
// clear — clears the terminal screen
// clui — draws command-line tables, gauges and spinners
// figlet — creates ASCII art from text
// inquirer — creates interactive command-line user interface
// minimist — parses argument options
// configstore — easily loads and saves config without you having to think about where and how.
const clear = require('clear');             // clear terminal
const chalk = require('chalk');             // colorize input
const figlet = require('figlet');           // ascii art
const flatten = require('flat');
const Configstore = require('configstore'); // easily loads and saves config without you having to think about where and how
const CLI = require('clui');
const locizeSyncConfig = require('./locize-sync-config');

// const Octokit = require('@octokit/rest');
const Spinner = CLI.Spinner;
const files = require('./lib/files');
const inspector = require('./lib/inspect');
inspector.init(locizeSyncConfig);

const inquirer = require('inquirer');

const i18next = require('./lib/i18next');
i18next.init(locizeSyncConfig);

const conf = new Configstore('ginit');

clear();

console.log("locizeSyncConfig", locizeSyncConfig);

console.log(
    chalk.yellow(
        figlet.textSync('locize sync', {horizontalLayout: 'full'})
    )
);

// if (files.directoryExists('.git')) {
//     console.log(chalk.red('Already a Git repository!'));
//     process.exit();
// }


const run = async () => {

    console.log("process.argv", process.argv);
    // pass saveMode to command line -> if not prompt first
    // pass languages to command line -> if not prompt first

    // find in files regex ]="xyz | i18next"
    // check if these keys exist in locize
    // ask to add key? [y | skip]
    // ask for translation
    // present summary
    // ask to add summary [y | skip]


    // const status = new Spinner('Authenticating you, please wait...');
    // status.start();
    //
    // setTimeout(() => {
    //     status.stop();
    // }, 1000)

    // const credentials = await inquirer.askGithubCredentials();
    // console.log(credentials);

    const keys = await inspector.findKeys(__dirname)
    const langs = await i18next.fetchAvailableLanguages();
    const resources = await getResources(langs);
    const actions = await collectNonTranslatedKeyActions(keys, langs, resources);
    const done = await addMissingTranslations(actions);
    console.debug('and we\'re done');
    //
    // i18next.updateRemoveTranslations().then(() => {
    //     console.log("updated translations");
    // });

};

async function getResources(langs) {

    console.debug('getResources', langs);

    let resources = {};
    for (const lang of Object.keys(langs)) {
        let _resourcesPerLang = await i18next.fetchNamespaceResources(lang);
        _resourcesPerLang = flatten(_resourcesPerLang);
        resources = {...resources, [lang]: _resourcesPerLang};
    }

    console.debug('getResources - result', resources);

    return resources;
}

async function collectNonTranslatedKeyActions(keys, langs, resources) {

    console.debug('collectNonTranslatedKeyActions')

    let actions = Object.keys(langs).reduce((res, key) => ({...res, [key]: {}}), {});
    for (const key of keys) {
        for (const lang of Object.keys(langs)) {
            const translation = resources[lang][key];
            if (!translation) {
                const answer = await handleNonTranslatedKey(key, langs[lang]);
                const entry = Object.entries(answer)[0];
                const value = entry[1];
                if (!!value) {
                    const key = entry[0].replace(/\*/g, '.');
                    actions = {...actions, [lang]: {...actions[lang], [key]: value}};
                }
            }
        }
    }

    console.debug('collectNonTranslatedKeyActions - result:', actions);

    return actions;
}

function handleNonTranslatedKey(key, lang) {

    return inquirer
        .prompt([
            {
                name: key.replace(/\./g, '*'),
                message: `How would you translate ${key} in ${lang.name}? (leave empty to skip)`,
            }
        ]);

}

async function addMissingTranslations(actions) {

    console.debug('addMissingTranslations');

    for (lang of Object.keys(actions)) {
        const _actions = actions[lang];
        if (Object.keys(_actions).length === 0) {
            continue;
        }

        try {
            await i18next.addMissingTranslations(lang, _actions);
        } catch (e) {
            const message = e.message || 'sth went wrong'
            console.error(message);
        }
    }

}

run();


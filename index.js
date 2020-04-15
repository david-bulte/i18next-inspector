#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');             // colorize input
const clearTerminal = require('clear');     // clear terminal
const figlet = require('figlet');           // ascii art
const flatten = require('flat');
const configstore = require('configstore'); // easily loads and saves config without you having to think about where and how
const clui = require('clui');               // draws command-line tables, gauges and spinners
const inquirer = require('inquirer');
const minimist = require('minimist');       // parses argument options
const merge = require('deepmerge')
const {convertArrayToCSV} = require('convert-array-to-csv');
const util = require('util');
const fs = require('fs');

const logger = require('./lib/logger');
const findKeys = require('./lib/find-keys');
const i18next = require('./lib/i18next');
const angularConfig = require('./lib/plugins/i18next-inspector-config-angular');

const Spinner = clui.Spinner;

const run = async () => {

    welcome();

    var argv = minimist(process.argv.slice(2));
    const debugLevel = argv['debugLevel'] || 'info';
    const config = getConfig();
    const saveToLocize = argv['saveToLocize'] || config.saveToLocize;

    init(debugLevel, config);

    const dirname = getSrcDir(config);
    const keys = await findKeys.find(dirname)
    const langs = await i18next.fetchAvailableLanguages();
    const resources = await getResources(langs);
    const actions = await collectNonTranslatedKeyActions(keys, langs, resources);
    if (saveToLocize) {
        await saveMissingTranslations(actions);
    } else {
        await saveMissingTranslationsToFile(actions);
    }
    console.log(chalk.blue('and we\'re done!'));

};

function getConfig() {

    const localConfig = require(path.dirname(process.cwd()) + path.sep + path.basename(process.cwd()) + path.sep + 'i18next-inspector-config');

    const angular = localConfig.framework === 'angular';
    if (angular) {
        return merge(angularConfig, localConfig);
    }

    return localConfig;
}

function getSrcDir(config) {
    const currentPath = path.dirname(process.cwd()) + path.sep + path.basename(process.cwd());
    const configPath = config.src && config.src.dir;

    if (!configPath) {
        return currentPath;
    }

    if (path.isAbsolute(configPath)) {
        return configPath;
    } else {
        return currentPath + path.sep + configPath;
    }
};

async function getResources(langs) {

    const spinner = new clui.Spinner('Fetching resources...');
    spinner.start();

    let resources = {};
    for (const lang of Object.keys(langs)) {
        let _resourcesPerLang = await i18next.fetchNamespaceResources(lang);
        _resourcesPerLang = flatten(_resourcesPerLang);
        resources = {...resources, [lang]: _resourcesPerLang};
    }

    logger.debug('getResources - result', resources);
    spinner.stop();

    return resources;
}

async function collectNonTranslatedKeyActions(keys, langs, resources) {

    logger.debug('collectNonTranslatedKeyActions', langs)

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

    logger.debug('collectNonTranslatedKeyActions - result:', actions);

    return actions;
}

function handleNonTranslatedKey(key, lang) {

    const question = {
        name: key.replace(/\./g, '*'),
        message: `How would you translate ${key} in ${lang.name}? (leave empty to skip)`,
    };

    logger.debug('question', question);

    return inquirer
        .prompt([
            question
        ]);

}

async function saveMissingTranslationsToFile(actions) {

    logger.debug('saveMissingTranslationsToFile');
    const spinner = new clui.Spinner('Saving translations to csv file...');
    spinner.start();

    let nothingToAdd = true;

    const translationsPerKey = {};
    Object.keys(actions).forEach(lang => {
        const translations = actions[lang];
        Object.keys(translations).forEach(key => {
            let translation = translationsPerKey[key];
            if (!translation) {
                translation = {key, tags: '', context: '', namespace: 'common'};
                translationsPerKey[key] = translation;
            }
            translation[lang] = translations[key];
            nothingToAdd = false;
        })
    })

    const csv = convertArrayToCSV(Object.values(translationsPerKey));
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('i18next-missing-translations.csv', csv);

    spinner.stop();

    if (nothingToAdd) {
        console.log(chalk.blue('nothing left to translate - good job!'));
    }
}

async function saveMissingTranslations(actions) {

    logger.debug('saveMissingTranslations');
    const spinner = new clui.Spinner('Saving translations to locize...');
    spinner.start();

    let nothingToAdd = true;
    for (lang of Object.keys(actions)) {
        const _actions = actions[lang];
        if (Object.keys(_actions).length === 0) {
            continue;
        }

        nothingToAdd = false;

        try {
            await i18next.addMissingTranslations(lang, _actions);
        } catch (e) {
            const message = e.message || 'sth went wrong'
            logger.error(message);
        }
    }

    spinner.stop();

    if (nothingToAdd) {
        console.log(chalk.blue('nothing left to translate - good job!'));
    }

}

run();

function init(logLevel, config) {
    logger.debugLevel = logLevel;
    findKeys.config = config.findKeys;
    i18next.config = config.locize;
}

function welcome() {
    clearTerminal();
    console.log(chalk.blue('here we go'));
}

# i18next-inspector
Let the inspector look at your application files and sync them with locize

![demo](https://github.com/david-bulte/i18next-inspector/blob/master/img/i18next-inspector.gif "demo")

## Installation

To install this library, run:

```bash
npm install @david-bulte/i18next-inspector --save-dev
```

This will install the library, and create a template config file (i18next-inspector-config.json) in your root folder. You need to specify some Locize authentication keys here.

## Running the inspector

Simply run 

```bash
i18next-inspector
```
The inspector will now scan your application looking for untranslated i18next keys and prompt you for their translation. By default the translations will be dumped into a csv file (i18next-missing-translations.csv). Should you immediately want to propagate the translations to Locize, you should pass the --saveToLocize flag, like so:

```bash
i18next-inspector  --saveToLocize true
```

## Extra config

Check the i18next-inspector-config.json file for how you change the configuration. We use some regexes while scanning the application for missing translation. For now there only exists defaults for Angular, but you can easily add your own, via the findKeys.regexes attribute. 

## License

MIT © [david-bulte](david.bulte@gmail.com)

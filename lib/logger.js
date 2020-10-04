const logger = exports;
const chalk = require('chalk');

const debug_levels = ['error', 'warn', 'info', 'debug']
logger.debugLevel = 'info';

function isEnabled(debugLevel) {
    return debug_levels.indexOf(debugLevel) <= debug_levels.indexOf(logger.debugLevel);
}

logger.error = function() {
    if (isEnabled('error')) {
        console.error(...[...arguments].map(argument => chalk.red(argument)));
    }
};

logger.warn = function() {
    if (isEnabled('warn')) {
        console.warn.call(this, ...arguments);
    }
};

logger.info = function() {
    if (isEnabled('info')) {
        console.info.call(this, ...arguments);
    }
};

logger.debug = function () {
    if (isEnabled('debug')) {
        console.debug.call(this, ...arguments);
    }
};

const chalk = require('chalk');

const utils = require('../utils.js');
const constants = require('./constants.js');
const appConstants = require('../constants.js');

function help() {
  utils.log('Usage:');
  utils.log('  ', chalk.bold(constants.baseCli, 'init [file]'));
  utils.log();
  utils.log('Description:');
  utils.log('  ', chalk.bold(constants.commands.init, 'Default:'), chalk.bold.magenta(appConstants.defaultConfigFile));
};

module.exports = help;

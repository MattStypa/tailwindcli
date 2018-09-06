const chalk = require('chalk');

const utils = require('../utils.js');
const constants = require('./constants.js');

function help() {
  utils.log('Usage:');
  utils.log('  ', chalk.bold(constants.baseCli, '[command] [flags]'));
  utils.log();
  utils.log('Commands:');
  utils.log('  ', chalk.bold('help [command]'), '   ', constants.commands.help);
  utils.log('  ', chalk.bold('init [file]'), '      ', constants.commands.init);
  utils.log('  ', chalk.bold('build <file>'), '     ', constants.commands.build);
};

module.exports = help;

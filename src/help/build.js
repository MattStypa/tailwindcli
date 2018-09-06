const chalk = require('chalk');

const utils = require('../utils.js');
const constants = require('./constants.js');
const appConstants = require('../constants.js');

function help() {
  utils.log('Usage:');
  utils.log('  ', chalk.bold(constants.baseCli, 'build <file>'));
  utils.log();
  utils.log('Description:');
  utils.log('  ', chalk.bold(constants.commands.build));
  utils.log();
  utils.log('Flags:');
  utils.log('  ', chalk.bold('-c --config <file>'), '   ', constants.flags.build.config, 'Default:', chalk.bold.magenta(appConstants.defaultConfigFile));
  utils.log('  ', chalk.bold('-o --output <file>'), '   ', constants.flags.build.output, 'Default:', chalk.bold.magenta(appConstants.defaultOutputFile));
  utils.log('  ', chalk.bold('-p --purge <glob>'), '    ', constants.flags.build.purge[0]);
  utils.log('                         ', constants.flags.build.purge[1]);
  utils.log('  ', chalk.bold('-m --minify'), '          ', constants.flags.build.minify);
};

module.exports = help;

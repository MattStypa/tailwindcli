const chalk = require('chalk');
const nodeEmoji = require('node-emoji');

const packageJson = require('../package.json');

function name() {
  return packageJson.name;
}

function version() {
  return packageJson.version;
}

function log(...msgs) {
  console.log('  ', ...msgs);
}

function success(...msgs) {
  msgs = msgs.map((msg) => chalk.bold.green(msg));
  console.log('  ', nodeEmoji.get('white_check_mark'), ...msgs);
}

function error(...msgs) {
  msgs = msgs.map((msg) => chalk.bold.red(msg));
  console.error('  ', nodeEmoji.get('no_entry_sign'), ...msgs);
}

function criticalError(...msgs) {
  error(...msgs);
  die();
}

function flatten(arr) {
  return [].concat(...arr)
}

function die() {
  log();
  process.exit(1);
}

module.exports = {name, version, log, success, error, criticalError, flatten, die};

#!/usr/bin/env node
const chalk = require('chalk');

const constants = require('./constants.js');
const utils = require('./utils.js');
const commands = require('./commands/index.js');

utils.log();
utils.log(chalk.bold(constants.name), chalk.bold.magenta(utils.version()), 'by', chalk.bold(constants.author));
utils.log();
main(process.argv.slice(2));

async function main(args) {
  try {
    await run(args);
  } catch (error) {
    utils.criticalError(error.stack);
  }
}

async function run(args) {
  const command = args.shift();

  if (!isCommandValid(command)) {
    utils.error('Invalid command.');
    utils.log();
    await commands.help();
    utils.die();
  }

  await commands[command](args);
  utils.log();
}

function isCommandValid(command) {
  return Object.keys(commands).includes(command);
}

/*
commander.version(packageJson.version, '-v, --version');

commander
  .command('build <file>')
  .option('-o, --output <path>', 'Output file')
  .action(build);

commander
  .command('*', null, {noHelp: true})
  .action(showHelp);

commander.parse(process.argv);
commander.args.length === 0 && showHelp();

function showHelp() {
  commander.help();
}

function build(file) {
  const time = process.hrtime();

  fs.existsSync(file) || error(chalk.bold.cyan(file), chalk.bold.red('does not exist.'));

  console.log(nodeEmoji.get('rocket'), 'Building', chalk.bold.cyan(file), '...');

  const prettyTime = prettyHrtime(process.hrtime(time));

  console.log(nodeEmoji.get('checkered_flag'), 'Finished in', chalk.bold.magenta(prettyTime));
}

function error(...msg) {
  console.error(...msg);
  process.exit(1);
}
*/

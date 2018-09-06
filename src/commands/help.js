const commands = require('../help/index.js');

async function help(args = []) {
  const command = args.shift();

  Object.keys(commands).includes(command) ? commands[command]() : commands.help();
}

module.exports = help;

const nodePath = require('path');

const chalk = require('chalk');
const fs = require('fs-extra');

const utils = require('../utils.js');
const appConstants = require('../constants.js');

async function init(args = []) {
  const file = args.shift() || appConstants.defaultConfigFile;

  await fs.exists(file) && utils.criticalError(chalk.bold.magenta(file), 'already exists.');

  const stubPath = await findTailwindConfigStub();

  !stubPath && utils.criticalError('Tailwind not found.');

  let stub = await fs.readFile(stubPath, 'utf8');
  stub = stub.replace('// let defaultConfig', 'let defaultConfig');
  stub = stub.replace("require('./plugins/container')", "require('tailwindcss/plugins/container')");

  await fs.outputFile(file, stub);

  utils.success('Created Tailwind config file:', chalk.bold.magenta(file));
}

async function findTailwindConfigStub() {
  const rootDir = nodePath.resolve('/');
  let dir = nodePath.resolve(__dirname);

  while (!await tailwindConfigStubExistsInDir(dir)) {
    if (dir === rootDir) {
      break;
    }

    dir = nodePath.resolve(dir, '..');
  }

  const stubPath = getStubPath(dir);

  return fs.existsSync(stubPath) ? stubPath : null;
}

async function tailwindConfigStubExistsInDir(dir) {
  return await fs.exists(getStubPath(dir));
}

function getStubPath(dir) {
  return nodePath.resolve(dir, 'node_modules/tailwindcss/defaultConfig.stub.js');
}
module.exports = init;

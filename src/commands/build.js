const autoprefixer = require('autoprefixer');
const bytes = require('bytes');
const chalk = require('chalk');
const fs = require('fs-extra');
const glob = require('glob');
const nodeEmoji = require('node-emoji');
const postcss = require('postcss');
const postcssClean = require('postcss-clean');
const prettyHrtime = require('pretty-hrtime');
const purgecss = require('@fullhuman/postcss-purgecss');
const tailwind = require('tailwindcss');

const utils = require('../utils.js');
const appConstants = require('../constants.js');
const TailwindExtractor = require('../TailwindExtractor.js');

const flagMap = {
  '-c': 'config', '--config': 'config',
  '-o': 'output', '--output': 'output',
  '-p': 'purge',  '--purge' : 'purge',
  '-m': 'minify', '--minify': 'minify',
  '-s': 'sourcemap', '--map': 'sourcemap', '--sourcemap': 'sourcemap',
};

async function build(args = []) {
  const time = process.hrtime();
  const file = args.shift();
  const flags = parseFlags(args);
  const config = flags['config'] && flags['config'][0] || appConstants.defaultConfigFile;
  const output = flags['output'] && flags['output'][0] || appConstants.defaultOutputFile;
  const purgeGlobs = flags['purge'] || false;
  const minifyFlag = !!flags['minify'];
  const sourcemapFlag = !!flags['sourcemap'];

  !await fs.exists(file) && utils.criticalError(chalk.bold.magenta(file), 'does not exist.');
  !await fs.exists(config) && utils.criticalError(chalk.bold.magenta(config), 'does not exist.');

  utils.log(nodeEmoji.get('rocket'), 'Building', chalk.bold.cyan(file), '...');
  printFlag('Purge', purgeGlobs);
  printFlag('Minify', minifyFlag);
  printFlag('Sourcemap', sourcemapFlag);
  utils.log();

  let input = await fs.readFile(file, 'utf8');
  let plugins = [tailwind(config), autoprefixer];

  purgeGlobs && plugins.push(getPurgecssPlugin(purgeGlobs));
  minifyFlag && plugins.push(postcssClean());

  const result = await postcss(plugins).process(input, {
    from: file,
    to: output,
    map: sourcemapFlag ? {inline: false} : false,
  });

  await fs.ensureFile(output);
  await fs.writeFile(output, result.css);

  if (sourcemapFlag) {
    await fs.ensureFile(output + '.map');
    await fs.writeFile(output + '.map', result.map);
  }

  const prettyTime = prettyHrtime(process.hrtime(time));

  utils.log(nodeEmoji.get('white_check_mark'), 'Finished in', chalk.bold.magenta(prettyTime));
  utils.log(nodeEmoji.get('package'), 'Size:', chalk.bold.magenta(bytes(result.css.length)));
  utils.log(nodeEmoji.get('floppy_disk'), 'Saved to', chalk.bold.cyan(output));
}

function printFlag(label, flag) {
  utils.log(' ', nodeEmoji.get(flag ? '+1' : 'o'), flag ? label : chalk.dim(label));
}

function getPurgecssPlugin(patterns) {
  const files = utils.flatten(patterns.map(pattern => glob.sync(pattern)));

  return purgecss({
    content: patterns,
    extractors: [
      {
        extractor: TailwindExtractor,
        extensions: files, // Apply the extractor to all content files
      },
    ],
  });
}

function parseFlags(args) {
  let flags = {default: []};
  let currentFlag = 'default';

  args.forEach((arg) => {
    if (flagMap[arg]) {
      currentFlag = flagMap[arg];
      !flags[currentFlag] && (flags[currentFlag] = []);
    } else {
      flags[currentFlag].push(arg);
    }
  });

  return flags;
}

module.exports = build;

const autoprefixer = require('autoprefixer');
const bytes = require('bytes');
const chalk = require('chalk');
const Cleancss = require('clean-css');
const fs = require('fs-extra');
const glob = require('glob');
const nodeEmoji = require('node-emoji');
const postcss = require('postcss');
const prettyHrtime = require('pretty-hrtime');
const Purgecss = require('purgecss');
const tailwind = require('tailwindcss');

const utils = require('../utils.js');
const appConstants = require('../constants.js');
const TailwindExtractor = require('../TailwindExtractor.js');

const flagMap = {
  '-c': 'config', '--config': 'config',
  '-o': 'output', '--output': 'output',
  '-p': 'purge',  '--purge' : 'purge',
  '-m': 'minify', '--minify': 'minify',
};

async function build(args = []) {
  const time = process.hrtime();
  const file = args.shift();
  const flags = parseFlags(args);
  const config = flags['config'] && flags['config'][0] || appConstants.defaultConfigFile;
  const output = flags['output'] && flags['output'][0] || appConstants.defaultOutputFile;
  const purgeGlobs = flags['purge'] || false;
  const minifyFlag = !!flags['minify'];

  !await fs.exists(file) && utils.criticalError(chalk.bold.magenta(file), 'does not exist.');
  !await fs.exists(config) && utils.criticalError(chalk.bold.magenta(config), 'does not exist.');

  utils.log(nodeEmoji.get('rocket'), 'Building', chalk.bold.cyan(file), '...');

  let css = await fs.readFile(file, 'utf8');
  css = await postcssProcess(config, css);
  purgeGlobs && (css = await purge(purgeGlobs, css));
  minifyFlag && (css = await minify(css));

  await fs.ensureFile(output);
  await fs.writeFile(output, css);

  const prettyTime = prettyHrtime(process.hrtime(time));

  utils.log(nodeEmoji.get('checkered_flag'), 'Finished in', chalk.bold.magenta(prettyTime));
  utils.log(nodeEmoji.get('package'), 'Size:', chalk.bold.magenta(bytes(css.length)));
  utils.log(nodeEmoji.get('floppy_disk'), 'Saved to', chalk.bold.cyan(output));
}

async function postcssProcess(tailwindConfig, css) {
  return (await postcss([tailwind(tailwindConfig), autoprefixer]).process(css, {from: undefined})).css;
}

async function purge(patterns, css) {
  const files = utils.flatten(patterns.map(pattern => glob.sync(pattern)));

  return new Purgecss({
    content: patterns,
    css: [{ raw: css }],
    extractors: [
      {
        extractor: TailwindExtractor,
        extensions: files, // Apply the extractor to all content files
      },
    ],
  }).purge()[0].css
}

async function minify(css) {
  return new Cleancss().minify(css).styles;
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

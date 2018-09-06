const constants = {
  baseCli: 'yarn tailwind',
  commands: {
    help: 'More information on command.',
    init: 'Creates Tailwind config file.',
    build: 'Compiles Tailwind CSS file.',
  },
  flags: {
    build: {
      config: 'Tailwind config file.',
      output: 'Compiled CSS file.',
      minify: 'Minify the compiled CSS.',
      purge: ['Purge unused CSS. Specify a glob of files to scan.', 'You can specify multiple globs.'],
    }
  }
};

module.exports = constants;

import autoprefixer from 'autoprefixer'
import bytes from 'bytes'
import chalk from 'chalk'
import postcss from 'postcss'
import postcssClean from 'postcss-clean'
import purgecss from '@fullhuman/postcss-purgecss'
import prettyHrtime from 'pretty-hrtime'

import tailwind from 'tailwindcss' // Core: Replace with '../..'

import TailwindExtractor from '../TailwindExtractor.js'

import commands from '.'
import * as emoji from '../emoji'
import * as utils from '../utils'

export const usage = 'build <file> [options]'
export const description = 'Compiles Tailwind CSS file.'

export const options = [
  {
    usage: '-o, --output <file>',
    description: 'Output file.',
  },
  {
    usage: '-c, --config <file>',
    description: 'Tailwind config file.',
  },
  {
    usage: '-p, --purge <directory|file>',
    description: 'Purge unused CSS.',
  },
  {
    usage: '-m, --minify',
    description: 'Minify the output CSS.',
  },
]

export const optionMap = {
  output: ['output', 'o'],
  config: ['config', 'c'],
  purge: ['purge', 'p'],
  minify: ['minify', 'm'],
}

/**
 * Prints the error message and stops the process.
 *
 * @param {...string} [msgs]
 */
function stop(...msgs) {
  utils.header()
  utils.error(...msgs)
  utils.die()
}

/**
 * Prints the error message and help for this command, then stops the process.
 *
 * @param {...string} [msgs]
 */
function stopWithHelp(...msgs) {
  utils.header()
  utils.error(...msgs)
  commands.help.forCommand(commands.build)
  utils.die()
}

/**
 * Prints status of the flag.
 *
 * @param {string} label
 * @param {boolean} flag
 */
function printFlag(label, flag) {
  utils.log(' ', flag ? emoji.thumbsUp : emoji.redRing, flag ? label : chalk.dim(label))
}

/**
 * Returns all existing files. If path is a directory it is read recursivily.
 *
 * @param {array} paths
 * @return {array}
 */
function getAllFilesFromPaths(paths) {
  const files = paths.filter(utils.isFile)
  const directories = paths.filter(utils.isDir)

  return files.concat(...directories.map(utils.readDirDeep))
}

/**
 * Gets configured purgecss plugin.
 *
 * @param {array} files
 * @return {function}
 */
function getPurgecssPlugin(files) {
  return purgecss({
    content: files,
    extractors: [
      {
        extractor: TailwindExtractor,
        extensions: files, // Apply the extractor to all content files
      },
    ],
  })
}

/**
 * Compiles CSS file.
 *
 * @param {string} inputFile
 * @param {string} configFile
 * @param {string} outputFile
 * @param {array} plugins
 * @return {Promise}
 */
function build(inputFile, configFile, outputFile, plugins) {
  const css = utils.readFile(inputFile)

  return new Promise((resolve, reject) => {
    postcss([tailwind(configFile), autoprefixer].concat(plugins))
      .process(css, {
        from: inputFile,
        to: outputFile,
      })
      .then(resolve)
      .catch(reject)
  })
}

/**
 * Runs the command.
 *
 * @param {string[]} cliParams
 * @param {object} cliOptions
 * @return {Promise}
 */
export function run(cliParams, cliOptions) {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime()
    const inputFile = cliParams[0]
    const configFile = cliOptions.config && cliOptions.config[0]
    const outputFile = cliOptions.output && cliOptions.output[0]
    const purgeContent = cliOptions.purge
    const minifyFlag = !!cliOptions.minify

    !inputFile && stopWithHelp('CSS file is required.')
    !utils.exists(inputFile) && stop(chalk.bold.magenta(inputFile), 'does not exist.')

    configFile &&
      !utils.exists(configFile) &&
      stop(chalk.bold.magenta(configFile), 'does not exist.')

    if (outputFile) {
      utils.header()
      utils.log()
      utils.log(emoji.go, 'Building', chalk.bold.cyan(inputFile), '...')
    }

    const contentFiles = purgeContent ? getAllFilesFromPaths(purgeContent) : []

    if (outputFile) {
      printFlag('Purge', contentFiles.length)
      printFlag('Minify', minifyFlag)
    }

    let plugins = []
    minifyFlag && plugins.push(postcssClean())
    contentFiles.length && plugins.push(getPurgecssPlugin(contentFiles))

    build(inputFile, configFile, outputFile, plugins)
      .then(result => {
        if (outputFile) {
          utils.writeFile(outputFile, result.css)

          const prettyTime = prettyHrtime(process.hrtime(startTime))

          utils.log()
          utils.log(emoji.yes, 'Finished in', chalk.bold.magenta(prettyTime))
          utils.log(emoji.pack, 'Size:', chalk.bold.magenta(bytes(result.css.length)))
          utils.log(emoji.disk, 'Saved to', chalk.bold.cyan(outputFile))
          utils.footer()
        } else {
          process.stdout.write(result.css)
        }
      })
      .then(resolve)
      .catch(reject)
  })
}

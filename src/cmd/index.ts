#!/usr/bin/env node

import { Command } from 'commander'

import { VERSION } from '../lib'
import { initScript } from './init'
import { runScript } from './run'
const cli = new Command()

cli
  .version(VERSION)
  .description(
    'Hazel CLI can be used to run or init single-file hazel script without the creation of node project.'
  )
  .name('hazel')

cli
  .command('run')
  .description('Run a provided single hazel script.')
  .argument('<file>', 'file path')
  .option(
    '-f, --force',
    'Force version exclusive scripts to run with incompatible version.',
    false
  )
  .action((filePath, options) => {
    runScript(filePath, options)
  })

cli
  .command('init')
  .description('Init a single hazel script file.')
  .option(
    '-n, --name <filename>',
    'File name or file path. If did not specify, console will prompt the question.',
    ''
  )
  .option(
    '--version-exclusive',
    'Make the script exclusive for current version.',
    false
  )
  .action((options) => {
    initScript(options)
  })

cli.parse(process.argv)

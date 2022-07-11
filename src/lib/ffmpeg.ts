import path from 'path'
import chalk from 'chalk'
import fs from 'fs-extra'
import { spawn, SpawnOptionsWithoutStdio } from 'child_process'

export function ffmpeg(commands: string, options: SpawnOptionsWithoutStdio = {}): any {
  let error = ''
  if (!options.cwd) options.cwd = '.'

  const fullCommands = ['-hide_banner', '-loglevel', 'error', '-y', ...commands.split(' ')]
  console.info(chalk.yellow.bold(`ffmpeg ${fullCommands.join(' ')}`))

  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', fullCommands, options)
    proc.stdout.on('data', function (data) {
      console.log(chalk.gray('ffmpeg:stdout', data))
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log(chalk.gray('ffmpeg:stderr', data))
      error = data
    })
    proc.on('close', function () {
      const outputPath = path.normalize(`${options.cwd}/${fullCommands[fullCommands.length - 1]}`)
      const outputExists = fs.pathExistsSync(outputPath)

      // Allows the case "there was an ffmpeg error but the file exists"
      if (!outputExists) {
        if (error) reject(error)
        reject('ffmpeg:error output file did not exist!')
      }

      console.log(chalk.green.bold('ffmpeg closing'))
      resolve('completed')
    })
  })
}

export function ffprobe(commands: string, options: SpawnOptionsWithoutStdio = {}): any {
  let stdout = ''
  const fullCommands = ['-hide_banner', '-loglevel', 'error', ...commands.split(' ')]
  console.info(chalk.yellow.bold(`ffprobe ${fullCommands.join(' ')}`))

  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', fullCommands, options)
    proc.stdout.on('data', function (data) {
      stdout += data
      console.log(chalk.gray('ffprobe:stdout', data))
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log(chalk.gray('ffprobe:stderr', data))
      reject(data)
    })
    proc.on('close', function () {
      console.log(chalk.green.bold('ffprobe closing'))
      resolve(JSON.parse(stdout))
    })
  })
}

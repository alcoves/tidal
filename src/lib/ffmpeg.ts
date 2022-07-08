import chalk from 'chalk'
import { spawn, SpawnOptionsWithoutStdio } from 'child_process'

export function ffmpeg(commands: string, options: SpawnOptionsWithoutStdio = {}): any {
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
      if (data.toLowerCase().includes('error')) reject(data)
    })
    proc.on('close', function () {
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

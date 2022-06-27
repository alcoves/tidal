import chalk from 'chalk'
import { spawn, exec, SpawnOptionsWithoutStdio, ExecOptions } from 'child_process'

export function shaka(command: string, options: ExecOptions = {}): any {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        reject(error.message)
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        if (command.includes('packager') || command.includes('ffmpeg')) {
          resolve(stderr)
        } else {
          reject(stderr)
        }
      }
      console.log(`stdout: ${stdout}`)
      resolve(stdout)
    })
  })
}

export function ffmpeg(commands: string, options: SpawnOptionsWithoutStdio = {}): any {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', commands.split(' '), options)
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
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', commands.split(' '), options)
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

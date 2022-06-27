import { String } from 'aws-sdk/clients/acm'
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
  let metadata = ''
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', commands.split(' '), options)
    proc.stdout.on('data', function (data) {
      metadata += data
      console.log(chalk.gray('ffprobe:stdout', data))
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log(chalk.gray('ffprobe:stderr', data))
      reject(data)
    })
    proc.on('close', function () {
      console.log(chalk.green.bold('ffprobe closing'))
      resolve(JSON.parse(metadata))
    })
  })
}

function ensureRcloneRemote(remote: string) {
  const envs = Object.keys(process.env).filter(k => {
    return k.includes(`RCLONE_CONFIG_${remote.toUpperCase()}_`)
  })

  // RCLONE_CONFIG_DOCO_TYPE
  // RCLONE_CONFIG_DOCO_ENDPOINT
  // RCLONE_CONFIG_DOCO_ACCESS_KEY_ID
  // RCLONE_CONFIG_DOCO_SECRET_ACCESS
  if (envs.length < 4) {
    throw new Error(`Invalid rclone remote: ${remote}. Ensure all rclone envs are defined`)
  }
}

export function rclone(command: string) {
  const [, src, dest] = command.split(' ')
  src.includes(':') ? ensureRcloneRemote(src.split(':')[0]) : null
  dest.includes(':') ? ensureRcloneRemote(dest.split(':')[0]) : null

  console.log(`running command :: rclone ${command}`)
  return new Promise((resolve, reject) => {
    const proc = spawn('rclone', command.split(' '), { env: process.env })
    proc.stdout.on('data', function (data) {
      console.log(chalk.gray('rclone:stdout', data))
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log(chalk.red('rclone:stderr', data))
      if (data.toLowerCase().includes('error')) reject(data)
    })
    proc.on('close', function (data) {
      console.log(chalk.green.bold('rclone:close'))
      resolve('completed')
    })
  })
}

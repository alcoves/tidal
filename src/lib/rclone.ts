import chalk from 'chalk'
import { exec, spawn } from 'child_process'

export function rclone(command: string) {
  console.log(`running command :: rclone ${command}`)
  return new Promise((resolve, reject) => {
    let output = ''
    const proc = spawn('rclone', command.split(' '), { env: process.env })
    proc.stdout.on('data', function (data) {
      output += data
      console.log(chalk.gray('rclone:stdout', data))
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log(chalk.red('rclone:stderr', data))
    })
    proc.on('close', function (data) {
      console.log(chalk.green.bold('rclone:close', data))
      resolve(output)
    })
  })
}

export function rcloneExec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`rclone ${command}`, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.blue(error.message))
        // reject(error)
      }
      if (stderr) {
        console.error(chalk.red(stderr))
        // reject(stderr)
      }
      console.log(chalk.green(stdout))
      resolve(stdout.replace(/(\r\n|\n|\r)/gm, '')) // Removes all new lines
    })
  })
}

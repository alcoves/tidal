import { spawn } from 'child_process'

export function rclone(commands: string) {
  console.log(`running command :: rclone ${commands}`)
  return new Promise((resolve, reject) => {
    const proc = spawn('rclone', commands.split(' '))
    proc.stdout.on('data', function (data) {
      console.log('rclone:stdout', data)
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log('rclone:stderr', data)
      if (data.toLowerCase().includes('error')) reject(data)
    })
    proc.on('close', function (data) {
      console.log('rclone:close')
      resolve('completed')
    })
  })
}

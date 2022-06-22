import { spawn } from 'child_process'

export function spawnFFmpeg(commands: string) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', commands.split(' '))
    proc.stdout.on('data', function (data) {
      console.log('stdout')
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log('stderr')
    })
    proc.on('close', function () {
      console.log('proc close')
      resolve('completed')
    })
  })
}

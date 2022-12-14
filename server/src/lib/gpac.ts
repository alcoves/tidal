import { spawn, SpawnOptionsWithoutStdio } from 'child_process'

export function gpac(commands: string, options: SpawnOptionsWithoutStdio = {}): any {
  let error = ''
  if (!options.cwd) options.cwd = '.'
  console.info(`gpac ${commands}`)

  return new Promise((resolve, reject) => {
    const proc = spawn('gpac', commands.split(' '), options)
    proc.stdout.on('data', function (data) {
      console.log('gpac:stdout', data)
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log('gpac:stderr', data)
      error = data
    })
    proc.on('close', function () {
      console.log('gpac closing')
      if (error) {
        console.error('GPAC ERROR:', error)
        // reject(error)
      }
      resolve('completed')
    })
  })
}

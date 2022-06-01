import { exec } from 'child_process'

export function execProm(command: string, directory: string) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: directory }, (error, stdout, stderr) => {
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

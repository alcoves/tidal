import axios from 'axios'
import * as stream from 'stream'
import { promisify } from 'util'
import { exec } from 'child_process'
import { createWriteStream } from 'fs-extra'

const finished = promisify(stream.finished)

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

export async function downloadFile(fileUrl: string, outputLocationPath: string): Promise<any> {
  const writer = createWriteStream(outputLocationPath)
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer)
    return finished(writer)
  })
}

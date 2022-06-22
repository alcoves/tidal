import Ffmpeg from 'fluent-ffmpeg'
import { Progress, FFmpegArgs } from '../types'

export async function ffmpeg({ input, commands, output, updateFunction }: FFmpegArgs) {
  return new Promise((resolve, reject) => {
    let lastProgress = 0
    Ffmpeg(input)
      .outputOptions(commands)
      .output(output)
      .on('start', function (commandLine) {
        console.log('Spawned ffmpeg with command: ' + commandLine)
      })
      .on('progress', async function (progress: Progress) {
        if (progress.percent >= 0) {
          const currentProgress = Math.floor(progress.percent)
          if (lastProgress !== currentProgress) {
            if (updateFunction) await updateFunction(currentProgress)
          }
          lastProgress = Math.ceil(progress.percent)
        }
      })
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message)
        reject(err.message)
      })
      .on('end', async function () {
        if (updateFunction) await updateFunction(100)
        console.log('Done')
        resolve('done')
      })
      .run()
  })
}

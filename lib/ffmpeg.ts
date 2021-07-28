import ffmpeg from 'fluent-ffmpeg'

export default function Ffmpeg (inPath: string, outPath: string, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inPath)

      .outputOptions(cmd.split(' '))
      .output(outPath)

      .on('progress', function (progress) {
        console.log('Processing: ' + progress.percent + '% done')
      })
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message)
        reject(err.message)
      })
      .on('end', function (stdout, stderr) {
        console.log('Transcoding succeeded !')
        resolve('done')
      })
      // This is noisy
      // .on('stderr', function (stderrLine) {
      // console.log('Stderr output: ' + stderrLine)
      // })
      .run()
  })
}

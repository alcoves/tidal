import { spawn } from 'child_process'

const ffmpegPath = '/usr/local/bin/ffmpeg'

export default function ffmpeg (inPath: string, outPath: string) {
  const args = [
    '-y', '-hide_banner',
    '-i', inPath,
    '-s', '640x480',
    '-codec:a', 'aac',
    '-b:a', '44.1k',
    '-r', '15',
    '-b:v', '1000k',
    '-c:v', 'h264',
    '-f', 'mp4', outPath
  ]

  const proc = spawn(ffmpegPath, args)

  return new Promise((resolve, reject) => {
    proc.stdout.on('data', function (data) {
      console.log(data)
    })

    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log('stderr data', data)
    })

    proc.on('close', function () {
      console.log('finished')
      resolve('done')
    })
  })
}

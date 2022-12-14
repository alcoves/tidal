import path from 'path'
import fs from 'fs-extra'
import { spawn } from 'child_process'

export function ffmpeg(commands: string): any {
  let error = ''

  const fullCommands = ['-hide_banner', '-loglevel', 'error', '-y', ...commands.split(' ')]
  console.info(`ffmpeg ${fullCommands.join(' ')}`)

  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', fullCommands)
    proc.stdout.on('data', function (data) {
      console.log('ffmpeg:stdout', data)
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log('ffmpeg:stderr', data)
      error = data
    })
    proc.on('close', function () {
      console.log('ffmpeg:close')
      const outputPath = path.normalize(fullCommands[fullCommands.length - 1])
      const outputExists = fs.pathExistsSync(outputPath)

      // Allows the case "there was an ffmpeg error but the file exists"
      if (!outputExists) {
        console.error('outputPath does not exist', outputPath)
        if (error) reject(error)
        reject('ffmpeg:error output file did not exist!')
      }

      console.log('ffmpeg closing')
      resolve('completed')
    })
  })
}

export function ffprobe(commands: string): any {
  let stdout = ''
  const fullCommands = ['-hide_banner', '-loglevel', 'error', ...commands.split(' ')]
  console.info(`ffprobe ${fullCommands.join(' ')}`)

  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', fullCommands)
    proc.stdout.on('data', function (data) {
      stdout += data
      console.log('ffprobe:stdout', data)
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log('ffprobe:stderr', data)
      reject(data)
    })
    proc.on('close', function () {
      console.log('ffprobe closing')
      resolve(JSON.parse(stdout))
    })
  })
}

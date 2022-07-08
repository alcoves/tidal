import path from 'path'
import chalk from 'chalk'
import { exec, ExecOptions } from 'child_process'
import { AdaptiveTranscodeStruct } from '../types'

export const PACKAGE_DIR = 'pkg'

export function shaka(command: string, options: ExecOptions = {}): any {
  return new Promise((resolve, reject) => {
    exec(`packager ${command}`, options, (error, stdout, stderr) => {
      if (error) {
        console.log(chalk.red.bold(`error: ${error.message}`))
        reject(error.message)
      }
      if (stderr) {
        console.log(chalk.yellow.bold(`stderr: ${stderr}`))
      }
      console.log(chalk.blue(`stdout: ${stdout}`))
      resolve(stdout)
    })
  })
}

export function getShakaPackagingCommand(transcodeCommands: AdaptiveTranscodeStruct[]): string {
  const shakaInputs = transcodeCommands.map(cmd => {
    const SOURCE_FILENAME = path.parse(cmd.outputFilename).name
    const DIRNAME = `${PACKAGE_DIR}/streams/${SOURCE_FILENAME}`
    if (cmd.type === 'audio') {
      return [
        `in=${cmd.outputFilename}`,
        `stream=${cmd.type}`,
        `output="${DIRNAME}/${SOURCE_FILENAME}.mp4"`,
        `playlist_name="${DIRNAME}/playlist.m3u8"`,
        `iframe_playlist_name="${DIRNAME}/iframes.m3u8"`,
        `hls_group_id=${cmd.type}`,
        `hls_name="${SOURCE_FILENAME}"`,
      ].join(',')
    } else if (cmd.type === 'video') {
      return [
        `in=${cmd.outputFilename}`,
        `stream=${cmd.type}`,
        `output="${DIRNAME}/${SOURCE_FILENAME}.mp4"`,
        `playlist_name="${DIRNAME}/playlist.m3u8"`,
        `iframe_playlist_name="${DIRNAME}/iframes.m3u8"`,
        `hls_group_id=${cmd.type}`,
        `hls_name="${SOURCE_FILENAME}"`,
      ].join(',')
    }
  })

  return [
    ...shakaInputs,
    '--hls_master_playlist_output',
    `${PACKAGE_DIR}/master.m3u8`,
    '--mpd_output',
    `${PACKAGE_DIR}/master.mpd`,
  ].join(' ')
}

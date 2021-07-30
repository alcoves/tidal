const { spawn } = require('child_process')

export function rcloneGetLink (sourcePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('rclone', ['link', '--expire', '5m', sourcePath])
    child.stderr.on('data', (d: Buffer) => reject(d.toString()))
    child.stdout.on('data', (d: Buffer) => {
      resolve(decodeURIComponent(d.toString().replace(/\s/g, '')))
    })
  })
}

export default function rclone (subCommand: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('rclone', [subCommand, ...args])
    child.stdout.on('data', (d: Buffer) => {
      process.stdout.write(d.toString())
    })
    child.stderr.on('data', (d: Buffer) => console.error(d.toString()))
    child.on('exit', (code: string) => {
      console.log(`Child process exited with code ${code}`)
      code ? reject(code) : resolve(code)
    })
  })
}

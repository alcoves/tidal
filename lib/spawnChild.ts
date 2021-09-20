import { spawn, SpawnOptionsWithoutStdio } from "child_process"

export async function spawnChild(binary: string, args: string[], opts: SpawnOptionsWithoutStdio): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn(binary, args, opts)
    proc.stdout.setEncoding("utf8")
    proc.stderr.setEncoding("utf8")

    proc.stdout.on("data", function(data) {
      console.log(data)
    })
    proc.stderr.on("data", function(data) {
      console.log(data)
    })
    proc.on("error", function(code) {
      reject(code)
    })
    proc.on("close", function(code) {
      code ? reject(code) : resolve(code)
    })
  })
}
import { Globals } from '../types'

const globals: Globals = {
  mainM3U8Name: 'main.m3u8',
  tidalBucket: process.env.TIDAL_BUCKET as string,
  tidalEndpoint: process.env.TIDAL_ENDPOINT as string,
}

const missingEnvs = Object.values(globals).filter(([k, v]: any) => {
  return !v ? `Environment variable ${k} is not set. Got value ${v}` : null
})

if (missingEnvs.length) throw new Error(missingEnvs.join('\n'))

export default globals

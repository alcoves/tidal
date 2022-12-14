import { Globals } from '../types'

const globals: Globals = {
  tidalBucket: process.env.TIDAL_BUCKET as string,
  tidalEndpoint: process.env.TIDAL_ENDPOINT as string,
  tidalCdnEndpoint: process.env.TIDAL_CDN_ENDPOINT as string,
}

const missingEnvs = Object.entries(globals).filter(([k, v]: any) => {
  return !v ? `Environment variable ${k} is not set. Got value ${v}` : null
})

if (missingEnvs.length) console.error(missingEnvs.join('\n'))

export default globals

import { EnvironmentVariables } from '../types'

const envVars: EnvironmentVariables = {
  apiKey: process.env.API_KEY as string,
  apiPort: process.env.API_PORT as string,
  redisHost: process.env.REDIS_HOST as string,
  redisPort: process.env.REDIS_PORT as string,
  tidalBucket: process.env.TIDAL_BUCKET as string,
  redisPassword: process.env.REDIS_PASSWORD as string,
  tidalEndpoint: process.env.TIDAL_ENDPOINT as string,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  awsDefaultRegion: process.env.AWS_DEFAULT_REGION as string,
  tidalCdnEndpoint: process.env.TIDAL_CDN_ENDPOINT as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}

const missingEnvs = Object.entries(envVars).filter(([k, v]: any) => {
  return !v ? `Environment variable ${k} is not set. Got value ${v}` : null
})

if (missingEnvs.length) console.error(missingEnvs.join('\n'))

export default envVars

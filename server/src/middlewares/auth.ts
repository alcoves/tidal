import envVars from '../config/envVars'

export async function apiKeyAuth(req, res, next) {
  const apiKey = envVars.apiKey
  if (req.headers['x-api-key'] !== apiKey) return res.status(403).end()
  next()
}

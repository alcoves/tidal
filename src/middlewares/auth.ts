export function tokenAuth(req, res, next) {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== process.env.AUTH_KEY) return res.sendStatus(403)
  next()
}

export function basicAuth(req, res, next) {
  const auth = {
    login: process.env.BULL_DASHBOARD_USERNAME,
    password: process.env.BULL_DASHBOARD_PASSWORD,
  }

  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

  if (login && password && login === auth.login && password === auth.password) {
    return next()
  }

  res.set('WWW-Authenticate', 'Basic realm="Access to tidal dashboard"')
  res.status(401).send('Authentication required.')
}

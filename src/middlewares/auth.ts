export const auth = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== process.env.AUTH_KEY) return res.sendStatus(403)
  next()
}

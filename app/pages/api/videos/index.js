// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (req, res) => {
  if (req.method === "POST") {
    // create video
    // go get tidal config
    // enqueue job
    // actually process video
    return res.status(200).end()
  }

  res.status(405).end()
}

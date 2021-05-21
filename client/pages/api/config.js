import axios from 'axios';

async function checkService(url) {
  try {
    const { status } = await axios.get(url);
    return status === 200 ? true : false;
  } catch (error) {
    console.error(error)
    return false;
  }
}

export default async function(req, res) {
  if (req.method === "GET") {
    const nomadUp = await checkService('http://localhost:4646/v1/status/leader')
    const consulUp = await checkService('http://localhost:8500/v1/status/leader')

    return res.status(200).json({
      tmpDir: "/tmp",
      consulUp,
      nomadUp,
    })
  }

  res.status(405).end()
}

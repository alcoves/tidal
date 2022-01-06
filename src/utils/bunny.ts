import axios from 'axios'

export async function purgeURL(url: string) {
  try {
    await axios.post(
      `https://api.bunny.net/purge?url=${url}`,
      {},
      {
        headers: {
          AccessKey: process.env.BUNNY_ACCESS_KEY || '',
        },
      }
    )
  } catch (error) {
    console.error(error)
  }
}

import axios from 'axios'
import { getSettings } from './redis'

export async function purgeURL(url: string) {
  try {
    console.log(`Purging URL ${url} from cdn`)
    const settings = await getSettings()
    await axios.post(
      `https://api.bunny.net/purge?url=${url}`,
      {},
      {
        headers: {
          AccessKey: settings.bunnyAccessKey || '',
        },
      }
    )
  } catch (error) {
    console.error(error)
  }
}

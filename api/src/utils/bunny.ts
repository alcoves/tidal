import axios from 'axios'

export function purgeURL(url: string, bunnyAccessKey: string) {
  console.log(`Purging URL ${url} from cdn`)
  return axios({
    method: 'POST',
    headers: { AccessKey: bunnyAccessKey },
    url: `https://api.bunny.net/purge?url=${url}`,
  })
}

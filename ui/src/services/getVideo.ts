import axios from 'axios'
import { tidalApiEndpoint, tidalTokenKey } from '../config/global'

const AUTH_TOKEN = localStorage.getItem(tidalTokenKey)
axios.defaults.headers.common['X-API-Key'] = `${AUTH_TOKEN}`

export function getVideo({ queryKey }: any) {
  const videoId = queryKey[0]
  return axios(`${tidalApiEndpoint}/videos/${videoId}`).then(result => result.data)
}

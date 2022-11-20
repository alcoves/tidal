import axios from 'axios'
import { TIDAL_API_ENDPOINT, TIDAL_LOCALSTORAGE_TOKEN_KEY } from '../config/global'

const AUTH_TOKEN = localStorage.getItem(TIDAL_LOCALSTORAGE_TOKEN_KEY)
axios.defaults.headers.common['X-API-Key'] = `${AUTH_TOKEN}`

export function getVideo({ queryKey }: any) {
  const videoId = queryKey[0]
  return axios(`${TIDAL_API_ENDPOINT}/videos/${videoId}`).then(result => result.data)
}

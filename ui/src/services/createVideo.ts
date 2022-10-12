import axios from 'axios'
import { TIDAL_LOCALSTORAGE_TOKEN_KEY, TIDAL_API_ENDPOINT } from '../config/global'

interface CreateVideoData {
  input: string
}

const AUTH_TOKEN = localStorage.getItem(TIDAL_LOCALSTORAGE_TOKEN_KEY)
axios.defaults.headers.common['X-API-Key'] = `${AUTH_TOKEN}`

export function createVideo(data: CreateVideoData) {
  return axios.post(`${TIDAL_API_ENDPOINT}/videos`, data).then(result => result.data)
}

import axios from 'axios'
import { tidalTokenKey, tidalApiEndpoint } from '../config/global'

interface CreateVideoData {
  input: string
}

const AUTH_TOKEN = localStorage.getItem(tidalTokenKey)
axios.defaults.headers.common['X-API-Key'] = `${AUTH_TOKEN}`

export function createVideo(data: CreateVideoData) {
  return axios.post(`${tidalApiEndpoint}/videos`, data).then(result => result.data)
}

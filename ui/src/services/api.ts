import axios, { AxiosError } from 'axios'
import { tidalTokenKey, tidalApiEndpoint } from '../config/global'

interface DeleteVideoData {
  id: string
}

const AUTH_TOKEN = localStorage.getItem(tidalTokenKey)
axios.defaults.headers.common['X-API-Key'] = `${AUTH_TOKEN}`

export function deleteVideo(data: DeleteVideoData) {
  return axios.delete(`${tidalApiEndpoint}/videos/${data.id}`).then(result => result.data)
}

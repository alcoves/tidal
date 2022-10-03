import axios from 'axios'
import { tidalTokenKey, tidalApiEndpoint } from '../config/global'

interface DeleteVideoRequestData {
  id: string
}

interface CreateThumbnailRequestData {
  id: string
  time: string
}

const AUTH_TOKEN = localStorage.getItem(tidalTokenKey)
axios.defaults.headers.common['X-API-Key'] = `${AUTH_TOKEN}`

export function deleteVideo(data: DeleteVideoRequestData) {
  return axios.delete(`${tidalApiEndpoint}/videos/${data.id}`).then(result => result.data)
}

export function getQueues() {
  return axios(`${tidalApiEndpoint}/queues`).then(result => result.data)
}

export function getQueue({ queryKey }: any) {
  const queueName = queryKey[0]
  return axios(`${tidalApiEndpoint}/queues/${queueName}`).then(result => result.data)
}

export function getJob({ queryKey }: any) {
  const [queueName, jobId] = queryKey
  return axios(`${tidalApiEndpoint}/queues/${queueName}/jobs/${jobId}`).then(result => result.data)
}

export function createThumbnail(data: CreateThumbnailRequestData) {
  return axios.post(`${tidalApiEndpoint}/videos/${data.id}/thumbnails`).then(result => result.data)
}

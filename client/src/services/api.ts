import axios from 'axios'
import { TIDAL_LOCALSTORAGE_TOKEN_KEY, TIDAL_API_ENDPOINT } from '../config/global'

interface DeleteVideoRequestData {
  id: string
}

interface CreateThumbnailRequestData {
  id: string
  time: string
}

interface CreateVideoFileRequestData {
  id: string
  cmd: string
}

interface RetryJobRequestData {
  jobId: string
  queueName: string
}

interface CreatePlaybackRequestData {
  id: string
}

const AUTH_TOKEN = localStorage.getItem(TIDAL_LOCALSTORAGE_TOKEN_KEY)
axios.defaults.headers.common['X-API-Key'] = `${AUTH_TOKEN}`

export function deleteVideo(data: DeleteVideoRequestData) {
  return axios.delete(`${TIDAL_API_ENDPOINT}/videos/${data.id}`).then(result => result.data)
}

export function getQueues() {
  return axios(`${TIDAL_API_ENDPOINT}/queues`).then(result => result.data)
}

export function getQueue({ queryKey }: any) {
  const queueName = queryKey[0]
  return axios(`${TIDAL_API_ENDPOINT}/queues/${queueName}`).then(result => result.data)
}

export function getJob({ queryKey }: any) {
  const [queueName, jobId] = queryKey
  return axios(`${TIDAL_API_ENDPOINT}/queues/${queueName}/jobs/${jobId}`).then(
    result => result.data
  )
}

export function createThumbnail(data: CreateThumbnailRequestData) {
  return axios
    .post(`${TIDAL_API_ENDPOINT}/videos/${data.id}/thumbnails`)
    .then(result => result.data)
}

export function createVideoFile(data: CreateVideoFileRequestData) {
  return axios.post(`${TIDAL_API_ENDPOINT}/videos/${data.id}/files`).then(result => result.data)
}

export function createPlayback(data: CreatePlaybackRequestData) {
  return axios.post(`${TIDAL_API_ENDPOINT}/videos/${data.id}/playbacks`).then(result => result.data)
}

export function retryJob(data: RetryJobRequestData) {
  return axios
    .post(`${TIDAL_API_ENDPOINT}/queues/${data.queueName}/jobs/${data.jobId}/retry`)
    .then(result => result.data)
}

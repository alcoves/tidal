import axios from 'axios'

export function getApiUrl() {
  const origin = window.location.origin
  if (origin.includes('localhost')) {
    return process.env.API_URL || 'http://localhost:5000'
  }
  return window.location.origin
}

export const fetcher = url =>
  axios
    .get(`${getApiUrl()}${url}`, {
      headers: {
        'x-api-key': localStorage.getItem('apiKey'),
      },
    })
    .then(res => res.data)

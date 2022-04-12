import axios from 'axios'
import { useEffect, useState } from 'react'
import { UseRequestConfig } from '../types'

function getApiUrl() {
  const origin = window.location.origin
  if (origin.includes('localhost')) {
    console.log(process.env.API_URL)
    return process.env.API_URL || 'http://localhost:500'
  }
  return window.location.origin
}

export function useLazyRequest(url: string, props: UseRequestConfig = { method: 'GET' }): any {
  const apiKey = localStorage.getItem('apiKey')

  const [data, setData] = useState<any>({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function call(overrides: any) {
    setLoading(true)
    axios({
      url: `${getApiUrl()}${url}`,
      method: props.method,
      ...overrides,
      headers: { 'x-api-key': apiKey },
    })
      .then(response => {
        setData(response.data)
        setLoading(false)
      })
      .catch(error => {
        setError(error)
        setLoading(false)
      })
  }

  return [call, { loading, data, error }]
}

export function useRequest(url: string, props: UseRequestConfig = { method: 'GET' }) {
  const [call, { loading, data, error }] = useLazyRequest(url, props)

  useEffect(() => {
    call()
  }, [])

  return { loading, data, error }
}
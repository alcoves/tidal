import axios from 'axios'
import { useEffect, useState } from 'react'
import { UseRequestConfig } from '../types'
import { getApiUrl } from '../utils/fetcher'

export function useLazyRequest(url?: string, props: UseRequestConfig = { method: 'GET' }): any {
  const apiKey = localStorage.getItem('apiKey')

  const [data, setData] = useState<any>({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function call(overrides: any) {
    return new Promise((resolve, reject) => {
      setLoading(true)
      axios({
        method: props.method,
        ...overrides,
        url: `${getApiUrl()}${url || overrides.url}`,
        headers: { 'x-api-key': apiKey },
      })
        .then(response => {
          setData(response.data)
          setLoading(false)
          resolve(response.data)
        })
        .catch(error => {
          setError(error)
          setLoading(false)
          reject(error)
        })
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

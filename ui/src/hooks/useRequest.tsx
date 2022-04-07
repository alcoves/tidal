import axios from 'axios'
import { useEffect, useState } from 'react'
import { UseRequestConfig } from '../types'

const API_URL = 'http://localhost:5000'

export function useLazyRequest(url: string, props: UseRequestConfig = { method: 'GET' }): any {
  const apiKey = localStorage.getItem('apiKey')

  const [data, setData] = useState<any>({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  function call(overrides: any) {
    axios({
      url: `${API_URL}${url}`,
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

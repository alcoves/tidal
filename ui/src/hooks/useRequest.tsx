import axios from 'axios'
import { useEffect, useState } from 'react'
import { UseRequestConfig } from '../types'

const API_URL = 'http://localhost:5000'

export function useRequest(url: string, props: UseRequestConfig = { method: 'GET' }) {
  const [data, setData] = useState<any>({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios({
      url: `${API_URL}${url}`,
      method: props.method,
      headers: {
        'x-api-key': '',
      },
    })
      .then(response => {
        setData(response.data)
        setLoading(false)
      })
      .catch(error => {
        setError(error)
        setLoading(false)
      })
  }, [])

  return { loading, data, error }
}

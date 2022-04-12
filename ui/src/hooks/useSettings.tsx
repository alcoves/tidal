import useSWR from 'swr'
import { fetcher } from '../utils/fetcher'

export function useSettings() {
  const { data, error } = useSWR(`/settings`, fetcher)
  return { settings: data, error }
}

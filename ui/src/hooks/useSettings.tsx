import { useRequest } from './useRequest'

export function useSettings() {
  const { data, loading, error } = useRequest('/settings')
  return { loading, settings: data, error }
}

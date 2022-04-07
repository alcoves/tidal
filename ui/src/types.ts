export interface Queue {
  name: string
  metrics: {
    jobs: {
      active: number
      failed: number
      paused: number
      delayed: number
      waiting: number
      completed: number
      'waiting-children': number
    }
  }
}

export interface UseRequestConfig {
  method?: string
}

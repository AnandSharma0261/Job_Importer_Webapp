/**
 * Simple Polling Utility
 * Regular API calls without complex socket implementation
 */

/**
 * Polling Configuration
 */
export interface PollingConfig {
  interval: number // milliseconds
  maxRetries?: number
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

/**
 * Simple Polling Function
 * Makes API calls at regular intervals for real-time data
 */
export class SimplePoller {
  private intervalId: NodeJS.Timeout | null = null
  private isPolling = false

  start(url: string, config: PollingConfig): void {
    if (this.isPolling) {
      console.log('⏰ Polling already started')
      return
    }

    this.isPolling = true
    console.log(`🔄 Starting polling for: ${url}`)

    this.intervalId = setInterval(async () => {
      try {
        const response = await fetch(url)
        const data = await response.json()
        
        if (config.onSuccess) {
          config.onSuccess(data)
        }
      } catch (error) {
        console.error('❌ Polling error:', error)
        if (config.onError) {
          config.onError(error)
        }
      }
    }, config.interval)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.isPolling = false
      console.log('⏹️ Polling stopped')
    }
  }

  isActive(): boolean {
    return this.isPolling
  }
}

/**
 * Convenient Polling Functions
 */

// Job stats polling
export const pollJobStats = (onUpdate: (stats: any) => void): SimplePoller => {
  const poller = new SimplePoller()
  
  poller.start('http://localhost:5000/api/jobs/stats', {
    interval: 2000, // 2 seconds for better responsiveness
    onSuccess: onUpdate,
    onError: (error) => console.error('Job stats polling error:', error)
  })
  
  return poller
}

// Import logs polling
export const pollImportLogs = (onUpdate: (logs: any) => void): SimplePoller => {
  const poller = new SimplePoller()
  
  poller.start('http://localhost:5000/api/import-logs', {
    interval: 3000, // 3 seconds
    onSuccess: onUpdate,
    onError: (error) => console.error('Import logs polling error:', error)
  })
  
  return poller
}

// Queue stats polling
export const pollQueueStats = (onUpdate: (stats: any) => void): SimplePoller => {
  const poller = new SimplePoller()
  
  poller.start('http://localhost:5000/api/queue/stats', {
    interval: 2000, // 2 seconds
    onSuccess: onUpdate,
    onError: (error) => console.error('Queue stats polling error:', error)
  })
  
  return poller
}

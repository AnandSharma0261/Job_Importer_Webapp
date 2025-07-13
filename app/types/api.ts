/**
 * API Types Definition
 * TypeScript types for backend API responses
 */

// Import log interface
export interface ImportLog {
  _id: string
  sessionId: string
  fileName: string
  importTime: string
  completedTime?: string
  status: 'processing' | 'success' | 'failed' | 'pending'
  
  // Statistics
  stats: {
    totalJobs: number
    newJobs: number
    updatedJobs: number
    failedJobs: number
    skippedJobs: number
  }
  
  // Source information
  source: {
    apiUrl: string
    apiName: string
    responseSize: number
  }
  
  // Performance metrics
  performance: {
    xmlParseTime: number
    dbOperationsTime: number
    networkTime: number
  }
  
  // Processing time (total)
  processingTime?: number
  
  // Error information
  errors?: Array<{
    type: string
    message: string
    timestamp: string
  }>
  
  // Additional metadata
  metadata?: Record<string, any>
}

// Job statistics interface
export interface JobStats {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  failedJobs: number
  totalImports: number
  successfulImports: number
  failedImports: number
  
  // Recent activity
  recentActivity: {
    last24Hours: number
    lastWeek: number
    lastMonth: number
  }
  
  // Performance metrics
  averageProcessingTime: number
  lastImportTime?: string
}

// Queue statistics interface
export interface QueueStats {
  activeJobs: number
  waitingJobs: number
  completedJobs: number
  failedJobs: number
  
  // Worker information
  workers: {
    active: number
    total: number
  }
  
  // Queue health
  isHealthy: boolean
  lastActivity?: string
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  timestamp: string
}

// Import request data
export interface ImportRequest {
  apiUrl: string
  apiName: string
  type: 'xml' | 'json'
  userId?: string
  metadata?: Record<string, any>
}

// Job progress updates for polling
export interface JobProgress {
  jobId: string
  progress: number
  message: string
  stage: string
  timestamp: string
}

// Polling configuration
export interface PollingSettings {
  jobStats: {
    enabled: boolean
    interval: number // milliseconds
  }
  importLogs: {
    enabled: boolean
    interval: number
  }
  queueStats: {
    enabled: boolean
    interval: number
  }
}

// Dashboard data for simple polling
export interface DashboardData {
  jobStats: JobStats
  queueStats: QueueStats
  recentImports: ImportLog[]
  lastUpdated: string
}

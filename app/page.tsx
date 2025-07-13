'use client'
import React, { useState, useEffect } from 'react'

// Data interfaces
interface ImportLog {
  id: number
  apiName: string
  apiUrl: string
  type: string
  status: string
  jobsFound: number
  createdAt: string
}

interface Stats {
  totalJobs: number
  pendingJobs: number
  completedJobs: number
  failedJobs: number
}

export default function SimpleDashboard() {
  const [importLogs, setImportLogs] = useState<ImportLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // API configuration
  const API_BASE = 'http://localhost:5000/api'

  const clearLocalData = () => {
    localStorage.removeItem('importLogs')
    localStorage.removeItem('currentStats')
    localStorage.removeItem('currentStatsTimestamp')
    console.log('🧹 Local data cleared, refreshing from backend')
    fetchData()
  }

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // API calls
      const [logsResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE}/import-logs`),
        fetch(`${API_BASE}/jobs/stats`)
      ])

      // Check API status
      console.log('🔍 API Response Status - Logs:', logsResponse.status, 'Stats:', statsResponse.status)

      let logsData, statsData

      if (!logsResponse.ok || !statsResponse.ok) {
        console.warn('⚠️ API not responding, using fallback mock data')
        
        // Get existing logs
        const existingLogs = JSON.parse(localStorage.getItem('importLogs') || '[]')
        
        // Mock data fallback
        logsData = {
          data: {
            importLogs: [
              ...existingLogs,
              {
                id: 1,
                apiName: 'Indeed Jobs API',
                apiUrl: 'https://api.indeed.com/jobs',
                type: 'json',
                status: 'completed',
                stats: { newJobs: 150 },
                createdAt: '2025-01-13T10:30:00Z'
              },
              {
                id: 2,
                apiName: 'LinkedIn Jobs API',
                apiUrl: 'https://api.linkedin.com/jobs',
                type: 'xml',
                status: 'pending',
                stats: { newJobs: 0 },
                createdAt: '2025-01-13T11:00:00Z'
              }
            ]
          }
        }

        statsData = {
          data: {
            statistics: {
              overview: {
                totalJobs: 1250,
                activeJobs: existingLogs.filter((log: any) => log.status === 'pending').length,
                completedJobs: 1180,
                failedJobs: 25
              }
            }
          }
        }
      } else {
        logsData = await logsResponse.json()
        statsData = await statsResponse.json()
        
        // Merge localStorage data
        const existingLogs = JSON.parse(localStorage.getItem('importLogs') || '[]')
        if ((!logsData.data?.importLogs || logsData.data.importLogs.length === 0) && existingLogs.length > 0) {
          console.log('📦 Merging localStorage data with backend response')
          logsData.data = {
            ...logsData.data,
            importLogs: existingLogs
          }
          
          // Update stats
          if (statsData.data?.statistics?.overview) {
            const pendingCount = existingLogs.filter((log: any) => log.status === 'pending').length
            statsData.data.statistics.overview.activeJobs = pendingCount
            // Add increment for localStorage entries
            statsData.data.statistics.overview.totalJobs = Math.max(
              statsData.data.statistics.overview.totalJobs, 
              existingLogs.length
            )
          }
        }
      }
      
      // Log API responses
      console.log('🔍 Import Logs Response:', logsData)
      console.log('🔍 Stats Response:', statsData)
      
      // Transform data
      const transformedLogs = logsData.data?.importLogs?.map((log: any) => ({
        id: log._id || log.id,
        apiName: log.fileName || log.apiName || log.source?.name || 'Unknown API',
        apiUrl: log.source?.url || log.apiUrl || log.endpoint || '',
        type: log.source?.type || log.type || 'json',
        status: log.status || 'unknown',
        jobsFound: log.stats?.newJobs || log.stats?.jobsProcessed || log.jobsProcessed || 0,
        createdAt: log.importTime || log.createdAt || new Date().toISOString()
      })) || []

      const transformedStats = {
        totalJobs: statsData.data?.statistics?.overview?.totalJobs || 0,
        pendingJobs: statsData.data?.statistics?.overview?.pendingJobs || 0,
        completedJobs: statsData.data?.statistics?.overview?.completedJobs || 0,
        failedJobs: statsData.data?.statistics?.overview?.failedJobs || 0
      }
      
      // Check stored stats
      const storedStats = localStorage.getItem('currentStats')
      const storedStatsTimestamp = localStorage.getItem('currentStatsTimestamp')
      
      if (storedStats && storedStatsTimestamp) {
        const parsedStoredStats = JSON.parse(storedStats)
        const timestampAge = Date.now() - parseInt(storedStatsTimestamp)
        
        // Use recent stored stats (under 30s)
        const currentPendingLogs = transformedLogs.filter((log: ImportLog) => log.status === 'pending').length
        
        if (timestampAge < 30000 && // Recent enough
            parsedStoredStats.pendingJobs >= currentPendingLogs && // Has pending jobs
            parsedStoredStats.pendingJobs > transformedStats.pendingJobs) { // More than backend
          console.log('📊 Using locally stored stats (recent manual import)')
          setImportLogs(transformedLogs)
          setStats(parsedStoredStats)
          return
        } else {
          // Clear old stats
          console.log('🧹 Clearing outdated localStorage stats')
          localStorage.removeItem('currentStats')
          localStorage.removeItem('currentStatsTimestamp')
        }
      }
      
      setImportLogs(transformedLogs)
      setStats(transformedStats)
      
    } catch (err: any) {
      setError('Failed to load data')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const [formData, setFormData] = useState({
    apiName: '',
    apiUrl: '',
    type: ''
  })

  const handleNewImport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE}/jobs/trigger-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiName: formData.apiName,
          apiUrl: formData.apiUrl,
          type: formData.type,
          triggeredBy: 'manual'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to trigger import')
      }

      const result = await response.json()
      console.log('✅ Import triggered:', result)
      console.log('🔍 Response status:', response.status)
      console.log('🔍 Full response:', result)
      
      // Get job ID
      const jobId = result.data?.jobId || result.jobId || result.id || 'Unknown'
      
      // Update localStorage
      const newImportLog = {
        id: result.data?.importLogId || Date.now(),
        apiName: formData.apiName,
        apiUrl: formData.apiUrl,
        type: formData.type,
        status: 'pending',
        stats: { newJobs: 0 },
        createdAt: new Date().toISOString()
      }
      
      const existingLogs = JSON.parse(localStorage.getItem('importLogs') || '[]')
      existingLogs.unshift(newImportLog) // Add to top
      localStorage.setItem('importLogs', JSON.stringify(existingLogs.slice(0, 10))) // Keep 10
      
      alert(`✅ Import started successfully! Job ID: ${jobId}`)
      
      // Reset form
      setFormData({ apiName: '', apiUrl: '', type: '' })
      
      // Update UI immediately
      const newLogEntry = {
        id: result.data?.importLogId || Date.now(),
        apiName: formData.apiName,
        apiUrl: formData.apiUrl,
        type: formData.type,
        status: 'pending',
        jobsFound: 0,
        createdAt: new Date().toISOString()
      }
      
      setImportLogs(prevLogs => [newLogEntry, ...prevLogs])
      
      // Update stats and persist
      setStats(prevStats => {
        const updatedStats = prevStats ? {
          ...prevStats,
          pendingJobs: prevStats.pendingJobs + 1,
          totalJobs: prevStats.totalJobs + 1
        } : {
          totalJobs: 1,
          pendingJobs: 1,
          completedJobs: 0,
          failedJobs: 0
        }
        
        // Store updated stats
        localStorage.setItem('currentStats', JSON.stringify(updatedStats))
        localStorage.setItem('currentStatsTimestamp', Date.now().toString())
        return updatedStats
      })
      
      // Schedule backend checks
      setTimeout(() => {
        console.log('🔄 Checking for backend updates (1st check)...')
        fetchData()
      }, 2000) // First check
      
      setTimeout(() => {
        console.log('🔄 Checking for backend updates (2nd check)...')
        fetchData()
      }, 5000) // Second check
      
      setTimeout(() => {
        console.log('🔄 Final check for backend updates...')
        fetchData()
      }, 10000) // Final check
      
    } catch (error: any) {
      console.error('❌ Import failed:', error)
      alert('❌ Failed to start import: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Header section */}
      <header style={styles.header}>
        <h1 style={styles.title}>🎯 Job Prompter Admin</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={clearLocalData} style={{...styles.refreshButton, backgroundColor: '#dc3545'}}>
            🧹 Clear Cache
          </button>
          <button onClick={fetchData} style={styles.refreshButton}>
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* Loading state */}
      {isLoading && (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={styles.error}>
          <p>❌ {error}</p>
          <button onClick={fetchData} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      {/* Main content */}
      {!isLoading && !error && (
        <main style={styles.main}>
          
          {/* Statistics */}
          {stats && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>📊 Stats</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <h3>Total Jobs</h3>
                  <p style={styles.statNumber}>{stats.totalJobs}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Pending</h3>
                  <p style={styles.statNumber}>{stats.pendingJobs}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Completed</h3>
                  <p style={styles.statNumber}>{stats.completedJobs}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Failed</h3>
                  <p style={styles.statNumber}>{stats.failedJobs}</p>
                </div>
              </div>
            </section>
          )}

          {/* Import form */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>➕ Start New Import</h2>
            <form onSubmit={handleNewImport} style={styles.form}>
              <input 
                type="text" 
                placeholder="API Name (e.g., Indeed Jobs)"
                style={styles.input}
                value={formData.apiName}
                onChange={(e) => setFormData({...formData, apiName: e.target.value})}
                required
              />
              <input 
                type="url" 
                placeholder="API URL"
                style={styles.input}
                value={formData.apiUrl}
                onChange={(e) => setFormData({...formData, apiUrl: e.target.value})}
                required
              />
              <select 
                style={styles.input} 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                required
              >
                <option value="">Select Type</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
              </select>
              <button type="submit" style={styles.submitButton} disabled={isLoading}>
                {isLoading ? '⏳ Starting...' : '🚀 Start Import'}
              </button>
            </form>
          </section>

          {/* Import logs */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>📝 Import History</h2>
            
            {importLogs.length === 0 ? (
              <p style={styles.noData}>No import logs found</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>API Name</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Jobs Found</th>
                      <th style={styles.th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importLogs.map(log => (
                      <tr key={log.id} style={styles.tableRow}>
                        <td style={styles.td}>{log.id}</td>
                        <td style={styles.td}>{log.apiName}</td>
                        <td style={styles.td}>{log.type.toUpperCase()}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: log.status === 'completed' ? '#10B981' : 
                                           log.status === 'pending' ? '#F59E0B' : '#EF4444'
                          }}>
                            {log.status}
                          </span>
                        </td>
                        <td style={styles.td}>{log.jobsFound}</td>
                        <td style={styles.td}>
                          {new Date(log.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </main>
      )}
    </div>
  )
}

// Styling
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    margin: 0,
    padding: 0
  },
  header: {
    backgroundColor: '#fff',
    padding: '20px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  refreshButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    color: '#666'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px'
  },
  error: {
    textAlign: 'center' as const,
    padding: '50px',
    color: '#dc3545'
  },
  retryButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  section: {
    backgroundColor: '#fff',
    padding: '25px',
    marginBottom: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
    borderBottom: '2px solid #007bff',
    paddingBottom: '5px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '6px',
    textAlign: 'center' as const,
    border: '1px solid #e9ecef'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '10px 0 0 0'
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    alignItems: 'end'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  submitButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  tableContainer: {
    overflowX: 'auto' as const
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '10px'
  },
  tableHeader: {
    backgroundColor: '#f8f9fa'
  },
  th: {
    padding: '12px',
    textAlign: 'left' as const,
    borderBottom: '2px solid #dee2e6',
    fontWeight: 'bold',
    color: '#495057'
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6'
  },
  td: {
    padding: '12px',
    verticalAlign: 'top' as const
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  noData: {
    textAlign: 'center' as const,
    color: '#666',
    fontStyle: 'italic',
    padding: '20px'
  }
}

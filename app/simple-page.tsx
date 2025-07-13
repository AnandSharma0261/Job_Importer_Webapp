'use client'
import React, { useState, useEffect } from 'react'

// Simple interfaces
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

  // Backend API calls
  const API_BASE = 'http://localhost:5000/api'

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Mock data for now since backend might not be ready
      const mockLogs: ImportLog[] = [
        {
          id: 1,
          apiName: 'Indeed Jobs',
          apiUrl: 'https://api.indeed.com/jobs',
          type: 'json',
          status: 'completed',
          jobsFound: 150,
          createdAt: '2025-01-13T10:30:00Z'
        },
        {
          id: 2,
          apiName: 'LinkedIn Jobs',
          apiUrl: 'https://api.linkedin.com/jobs',
          type: 'xml',
          status: 'pending',
          jobsFound: 0,
          createdAt: '2025-01-13T11:00:00Z'
        }
      ]

      const mockStats: Stats = {
        totalJobs: 1250,
        pendingJobs: 45,
        completedJobs: 1180,
        failedJobs: 25
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setImportLogs(mockLogs)
      setStats(mockStats)
      
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

  const handleNewImport = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Import feature would trigger here')
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🎯 Job Prompter Admin</h1>
        <button onClick={fetchData} style={styles.refreshButton}>
          🔄 Refresh
        </button>
      </header>

      {/* Loading */}
      {isLoading && (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.error}>
          <p>❌ {error}</p>
          <button onClick={fetchData} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <main style={styles.main}>
          
          {/* Stats */}
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

          {/* New Import Form */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>➕ Start New Import</h2>
            <form onSubmit={handleNewImport} style={styles.form}>
              <input 
                type="text" 
                placeholder="API Name (e.g., Indeed Jobs)"
                style={styles.input}
                required
              />
              <input 
                type="url" 
                placeholder="API URL"
                style={styles.input}
                required
              />
              <select style={styles.input} required>
                <option value="">Select Type</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
              </select>
              <button type="submit" style={styles.submitButton}>
                🚀 Start Import
              </button>
            </form>
          </section>

          {/* Import History */}
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

// Simple CSS-in-JS styles
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

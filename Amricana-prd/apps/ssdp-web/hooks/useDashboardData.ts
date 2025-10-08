import { useState, useEffect, useCallback } from 'react'
import { getDashboardData } from '../lib/api'

export interface DashboardData {
  total_sales_today: number
  active_vehicles: number
  active_customers: number
  completed_orders: number
  pending_orders: number
  sales_trend: Array<{
    date: string
    amount: number
  }>
  top_products: Array<{
    name: string
    sales: number
  }>
}

export function useDashboardData(refreshInterval: number = 30000) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const response = await getDashboardData()
      
      if (response.success && response.data) {
        setData(response.data as DashboardData)
      } else {
        throw new Error(response.error || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Dashboard data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()

    // Set up auto-refresh
    const interval = setInterval(fetchData, refreshInterval)

    return () => {
      clearInterval(interval)
    }
  }, [fetchData, refreshInterval])

  return {
    data,
    loading,
    error,
    refetch
  }
}

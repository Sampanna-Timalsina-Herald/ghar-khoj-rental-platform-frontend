import { useState, useCallback } from 'react'
import api from '../api/axios'

const useApi = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(url, options)
      setData(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [url, options])

  return { data, loading, error, fetchData }
}

export default useApi

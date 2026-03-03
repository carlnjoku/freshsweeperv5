// hoc/withDataFetch.js
// hooks/useDataFetch.js - Updated version
// hooks/useDataFetch.js
import { useState, useEffect, useCallback } from 'react';

const useDataFetch = (fetchFunction, params = [], options = {}) => {
  const {
    autoFetch = true,
    initialData = null,
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the fetch function
      const result = await fetchFunction(...params);
      
      // Handle different response structures
      let finalData;
      
      if (result) {
        // If result is an Axios response with data property
        if (result.data !== undefined) {
          finalData = result.data;
        } 
        // If result is the actual data (direct return)
        else if (result && typeof result === 'object') {
          finalData = result;
        }
        // If result is a string or other type
        else {
          finalData = result;
        }
      } else {
        throw new Error('No data received from server');
      }
      
      setData(finalData);
      
      if (onSuccess) {
        onSuccess(finalData);
      }
      
      setRetryAttempts(0); // Reset retry attempts on success
    } catch (err) {
      console.error('Fetch error:', err);
      
      // Handle different error types
      let errorMessage = err.message || 'An unexpected error occurred';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message === 'Invalid response structure') {
        // Specific error from our hook
        errorMessage = 'Server returned an unexpected response format.';
      }
      
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage, err);
      }
      
      // Auto-retry logic
      if (retryAttempts < retryCount) {
        setTimeout(() => {
          setRetryAttempts(prev => prev + 1);
          fetchData();
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, JSON.stringify(params), onSuccess, onError, retryAttempts, retryCount, retryDelay]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  const refetch = useCallback(() => {
    setRetryAttempts(0);
    return fetchData();
  }, [fetchData]);

  const clearData = useCallback(() => {
    setData(initialData);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    refetch,
    clearData,
    retryAttempts,
    setData,
  };
};

export default useDataFetch;
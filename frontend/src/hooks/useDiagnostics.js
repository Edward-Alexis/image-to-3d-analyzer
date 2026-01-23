import { useState, useCallback, useEffect } from 'react';
import { diagnosticService } from '@/services/diagnosticService';

export const useDiagnostics = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (days = 7) => {
    setLoading(true);
    try {
      const result = await diagnosticService.getStats(days);
      if (result) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async (limit = 50, page = 1) => {
    setLoading(true);
    try {
      const result = await diagnosticService.getLogs(limit, page);
      if (result) {
        setLogs(result.data.logs);
      }
    } catch (error) {
      console.error('Error obteniendo logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const cleanOldLogs = useCallback(async (days = 30) => {
    try {
      const result = await diagnosticService.cleanLogs(days);
      if (result) {
        await fetchLogs();
        return result;
      }
    } catch (error) {
      console.error('Error limpiando logs:', error);
    }
  }, [fetchLogs]);

  return {
    stats,
    logs,
    loading,
    fetchStats,
    fetchLogs,
    cleanOldLogs,
  };
};
import { useCallback, useEffect, useRef, useState } from 'react';
import { checkLocalPrintAgentHealth } from '../Utils/localPrintAgent';

const POLL_INTERVAL_MS = 30000;

/**
 * Polls the local print agent's /health endpoint so POS UI (e.g. POSHeader)
 * can show connection/role readiness without owning any polling logic itself.
 *
 * @param {Object} [options]
 * @param {number} [options.pollIntervalMs=30000]
 * @returns {{connected: boolean, loading: boolean, error: string|null, health: Object|null, retry: () => void}}
 */
function useLocalPrintAgentStatus({ pollIntervalMs = POLL_INTERVAL_MS } = {}) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const runCheck = useCallback(async () => {
    setLoading(true);
    const result = await checkLocalPrintAgentHealth();
    if (!mountedRef.current) return;
    setConnected(result.connected);
    setHealth(result.health || null);
    setError(result.connected ? null : (result.errorMessage || 'Local Print Agent is not running on this machine.'));
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    runCheck();

    intervalRef.current = setInterval(runCheck, pollIntervalMs);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runCheck, pollIntervalMs]);

  const retry = useCallback(() => {
    runCheck();
  }, [runCheck]);

  return { connected, loading, error, health, retry };
}

export default useLocalPrintAgentStatus;

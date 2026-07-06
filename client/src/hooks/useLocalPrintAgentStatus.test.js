import { renderHook, waitFor, act } from '@testing-library/react';
import useLocalPrintAgentStatus from './useLocalPrintAgentStatus';

function mockHealthResponse(response, ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: jest.fn().mockResolvedValue(response),
  });
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('useLocalPrintAgentStatus', () => {
  it('checks health on mount and reports connected state', async () => {
    mockHealthResponse({ ok: true, roles: { receipt: { configured: true, printerFound: true } } });

    const { result } = renderHook(() => useLocalPrintAgentStatus());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.connected).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.health.roles.receipt.configured).toBe(true);
  });

  it('reports disconnected state and an error message when the agent is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('connect ECONNREFUSED'));

    const { result } = renderHook(() => useLocalPrintAgentStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('retry() re-runs the health check', async () => {
    mockHealthResponse({ ok: true });

    const { result } = renderHook(() => useLocalPrintAgentStatus());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.retry();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('polls on the given interval and cleans up the timer on unmount', async () => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    mockHealthResponse({ ok: true });

    const { result, unmount } = renderHook(() => useLocalPrintAgentStatus({ pollIntervalMs: 1000 }));

    await act(async () => {
      await Promise.resolve();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(5000);
      await Promise.resolve();
    });
    // No further calls after unmount — interval was cleared.
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

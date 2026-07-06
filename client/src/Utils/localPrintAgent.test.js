import {
  checkLocalPrintAgentHealth,
  printReceiptInstructions,
  printBarcodeLabelInstructions,
  printA4Pdf,
  mapLocalPrintAgentError,
  LOCAL_PRINT_AGENT_BASE_URL,
} from './localPrintAgent';

function mockFetchOnce(response, ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: jest.fn().mockResolvedValue(response),
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('checkLocalPrintAgentHealth', () => {
  it('handles a connected response', async () => {
    mockFetchOnce({ ok: true, version: '1.0.0', roles: { receipt: { configured: true, printerFound: true } } });

    const result = await checkLocalPrintAgentHealth();

    expect(result.connected).toBe(true);
    expect(result.health.version).toBe('1.0.0');
    expect(global.fetch).toHaveBeenCalledWith(`${LOCAL_PRINT_AGENT_BASE_URL}/health`, expect.any(Object));
  });

  it('handles a connection failure (agent not running)', async () => {
    global.fetch = jest.fn().mockRejectedValue(Object.assign(new Error('connect ECONNREFUSED'), { name: 'TypeError' }));

    const result = await checkLocalPrintAgentHealth();

    expect(result.connected).toBe(false);
    expect(result.errorCode).toBe('ECONNREFUSED');
  });

  it('maps an abort/timeout to a TIMEOUT error code', async () => {
    global.fetch = jest.fn().mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));

    const result = await checkLocalPrintAgentHealth();

    expect(result.connected).toBe(false);
    expect(result.errorCode).toBe('TIMEOUT');
  });
});

describe('printReceiptInstructions', () => {
  it('sends the correct receipt payload shape', async () => {
    mockFetchOnce({});

    const instructions = [{ type: 'text', value: 'hello' }];
    const result = await printReceiptInstructions({ jobId: 'INV-1001', copies: 2, instructions });

    expect(result.ok).toBe(true);
    const [url, requestInit] = global.fetch.mock.calls[0];
    expect(url).toBe(`${LOCAL_PRINT_AGENT_BASE_URL}/print`);
    const body = JSON.parse(requestInit.body);
    expect(body).toEqual({
      jobId: 'INV-1001',
      printRole: 'receipt',
      commandLanguage: 'ESC_POS',
      payloadType: 'PRINT_INSTRUCTIONS',
      copies: 2,
      payload: {
        width: 42,
        instructions,
      },
    });
  });
});

describe('printBarcodeLabelInstructions', () => {
  it('sends the correct barcode-label payload shape', async () => {
    mockFetchOnce({});

    const instructions = [{ type: 'barcode', x: 10, y: 10, value: '12345' }];
    const result = await printBarcodeLabelInstructions({
      jobId: 'LBL-1001',
      copies: 1,
      instructions,
      labelOptions: { labelWidthMm: 50, labelHeightMm: 25, gapMm: 3 },
    });

    expect(result.ok).toBe(true);
    const [, requestInit] = global.fetch.mock.calls[0];
    const body = JSON.parse(requestInit.body);
    expect(body).toEqual({
      jobId: 'LBL-1001',
      printRole: 'barcode-label',
      commandLanguage: 'TSPL',
      payloadType: 'PRINT_INSTRUCTIONS',
      copies: 1,
      payload: {
        labelWidthMm: 50,
        labelHeightMm: 25,
        gapMm: 3,
        instructions,
      },
    });
  });
});

describe('printA4Pdf', () => {
  it('sends the correct PDF payload shape', async () => {
    mockFetchOnce({});

    const result = await printA4Pdf({ jobId: 'INV-1001-A4', base64Pdf: 'BASE64DATA', copies: 1 });

    expect(result.ok).toBe(true);
    const [, requestInit] = global.fetch.mock.calls[0];
    const body = JSON.parse(requestInit.body);
    expect(body).toEqual({
      jobId: 'INV-1001-A4',
      printRole: 'a4-invoice',
      commandLanguage: 'PDF',
      payloadType: 'PDF',
      payloadEncoding: 'base64',
      copies: 1,
      payload: 'BASE64DATA',
    });
  });
});

describe('mapLocalPrintAgentError', () => {
  it.each([
    ['ECONNREFUSED', 'Local Print Agent is not running on this machine.'],
    ['PRINT_ROLE_NOT_CONFIGURED', 'Printer is not configured for this counter.'],
    ['WINDOWS_PRINTER_NOT_FOUND', 'Configured printer is missing in Windows.'],
    ['UNSUPPORTED_COMMAND_LANGUAGE', 'Printer configuration does not match this print type.'],
    ['PRINT_QUEUE_FAILED', 'Windows could not accept the print job.'],
    ['PDF_PRINT_TOOL_NOT_FOUND', 'A4 PDF printing requires SumatraPDF.exe in the print agent folder.'],
  ])('maps %s to the expected message', (errorCode, expectedMessage) => {
    expect(mapLocalPrintAgentError({ errorCode })).toBe(expectedMessage);
  });

  it('falls back to the raw error message for unknown codes', () => {
    expect(mapLocalPrintAgentError({ errorCode: 'SOMETHING_ELSE', errorMessage: 'custom message' })).toBe('custom message');
  });
});

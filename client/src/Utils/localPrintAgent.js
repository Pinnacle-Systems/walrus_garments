/**
 * Client for the local POS Print Agent — a Windows service running on the
 * counter machine at http://127.0.0.1:17777. This is a separate localhost
 * origin from the Web POS backend, so it must never go through RTK Query
 * or carry backend auth headers.
 *
 * Printer configuration (physical Windows printer names, driver setup) is
 * owned entirely by the local print agent. Web POS only knows logical
 * print roles: "receipt", "barcode-label", "a4-invoice".
 */

const LOCAL_PRINT_AGENT_BASE_URL = 'http://127.0.0.1:17777';
const HEALTH_TIMEOUT_MS = 1500;
const PRINT_TIMEOUT_MS = 5000;

/**
 * @typedef {Object} PrintRoleStatus
 * @property {boolean} configured
 * @property {boolean} [printerFound]
 * @property {string} [printerName] - For support visibility only. Never persist this in Web POS.
 */

/**
 * @typedef {Object} LocalPrintAgentHealth
 * @property {boolean} ok
 * @property {string} [version]
 * @property {Object.<string, PrintRoleStatus>} [roles] - Keyed by print role: receipt, barcode-label, a4-invoice.
 */

/**
 * @typedef {Object} LocalPrintAgentHealthResult
 * @property {boolean} connected
 * @property {LocalPrintAgentHealth} [health]
 * @property {string} [errorCode]
 * @property {string} [errorMessage]
 */

/**
 * @typedef {'text'|'line'|'feed'|'cut'|'leftRight'|'blank'|'openDrawer'|'barcode'|'qr'} ReceiptInstructionType
 */

/**
 * @typedef {Object} ReceiptInstruction
 * @property {ReceiptInstructionType} type
 */

/**
 * @typedef {Object} PrintReceiptResult
 * @property {boolean} ok
 * @property {string} [jobId]
 * @property {string} [errorCode]
 * @property {string} [errorMessage]
 */

function withTimeout(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

async function parseErrorResponse(response) {
  try {
    const body = await response.json();
    return {
      errorCode: body?.errorCode || `HTTP_${response.status}`,
      errorMessage: body?.message,
    };
  } catch (e) {
    return { errorCode: `HTTP_${response.status}`, errorMessage: undefined };
  }
}

function toErrorCode(error) {
  if (error?.name === 'AbortError') return 'TIMEOUT';
  if (error?.errorCode) return error.errorCode;
  return 'ECONNREFUSED';
}

/**
 * Checks whether the local print agent is reachable on this machine.
 * @returns {Promise<LocalPrintAgentHealthResult>}
 */
export async function checkLocalPrintAgentHealth() {
  const { signal, clear } = withTimeout(HEALTH_TIMEOUT_MS);
  try {
    const response = await fetch(`${LOCAL_PRINT_AGENT_BASE_URL}/health`, { signal });
    if (!response.ok) {
      const { errorCode, errorMessage } = await parseErrorResponse(response);
      return { connected: false, errorCode, errorMessage };
    }
    const health = await response.json();
    return { connected: true, health };
  } catch (error) {
    return { connected: false, errorCode: toErrorCode(error), errorMessage: error?.message };
  } finally {
    clear();
  }
}

/**
 * Fetches the local print agent's version info.
 * @returns {Promise<{ok: boolean, version?: string, errorCode?: string, errorMessage?: string}>}
 */
export async function getLocalPrintAgentVersion() {
  const { signal, clear } = withTimeout(HEALTH_TIMEOUT_MS);
  try {
    const response = await fetch(`${LOCAL_PRINT_AGENT_BASE_URL}/version`, { signal });
    if (!response.ok) {
      const { errorCode, errorMessage } = await parseErrorResponse(response);
      return { ok: false, errorCode, errorMessage };
    }
    const body = await response.json();
    return { ok: true, version: body?.version };
  } catch (error) {
    return { ok: false, errorCode: toErrorCode(error), errorMessage: error?.message };
  } finally {
    clear();
  }
}

async function postPrintJob(payload) {
  const { signal, clear } = withTimeout(PRINT_TIMEOUT_MS);
  try {
    const response = await fetch(`${LOCAL_PRINT_AGENT_BASE_URL}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
    if (!response.ok) {
      const { errorCode, errorMessage } = await parseErrorResponse(response);
      return { ok: false, jobId: payload.jobId, errorCode, errorMessage };
    }
    return { ok: true, jobId: payload.jobId };
  } catch (error) {
    return { ok: false, jobId: payload.jobId, errorCode: toErrorCode(error), errorMessage: error?.message };
  } finally {
    clear();
  }
}

/**
 * Sends a generic receipt print job (ESC/POS role) to the local print agent.
 * @param {Object} params
 * @param {string} params.jobId
 * @param {number} params.copies
 * @param {ReceiptInstruction[]} params.instructions
 * @param {number} [params.width=42]
 * @returns {Promise<PrintReceiptResult>}
 */
export async function printReceiptInstructions({ jobId, copies, instructions, width = 42 }) {
  return postPrintJob({
    jobId,
    printRole: 'receipt',
    commandLanguage: 'ESC_POS',
    payloadType: 'PRINT_INSTRUCTIONS',
    copies,
    payload: {
      width,
      instructions,
    },
  });
}

/**
 * Sends a generic barcode label print job (TSPL role) to the local print agent.
 * @param {Object} params
 * @param {string} params.jobId
 * @param {number} params.copies
 * @param {Array} params.instructions
 * @param {Object} [params.labelOptions]
 * @param {number} [params.labelOptions.labelWidthMm=50]
 * @param {number} [params.labelOptions.labelHeightMm=25]
 * @param {number} [params.labelOptions.gapMm=3]
 * @returns {Promise<PrintReceiptResult>}
 */
export async function printBarcodeLabelInstructions({ jobId, copies, instructions, labelOptions = {} }) {
  const { labelWidthMm = 50, labelHeightMm = 25, gapMm = 3 } = labelOptions;
  return postPrintJob({
    jobId,
    printRole: 'barcode-label',
    commandLanguage: 'TSPL',
    payloadType: 'PRINT_INSTRUCTIONS',
    copies,
    payload: {
      labelWidthMm,
      labelHeightMm,
      gapMm,
      instructions,
    },
  });
}

/**
 * Sends a base64-encoded A4 PDF print job to the local print agent.
 * @param {Object} params
 * @param {string} params.jobId
 * @param {string} params.base64Pdf
 * @param {number} [params.copies=1]
 * @returns {Promise<PrintReceiptResult>}
 */
export async function printA4Pdf({ jobId, base64Pdf, copies = 1 }) {
  return postPrintJob({
    jobId,
    printRole: 'a4-invoice',
    commandLanguage: 'PDF',
    payloadType: 'PDF',
    payloadEncoding: 'base64',
    copies,
    payload: base64Pdf,
  });
}

/**
 * Opens the local print agent's printer setup page in a new tab.
 * Printer configuration is local to the counter machine and is never
 * stored in the Web POS.
 */
export function openLocalPrintAgentSetup() {
  window.open(`${LOCAL_PRINT_AGENT_BASE_URL}/setup`, '_blank');
}

const ERROR_MESSAGE_MAP = {
  ECONNREFUSED: 'Local Print Agent is not running on this machine.',
  TIMEOUT: 'Local Print Agent is not running on this machine.',
  PRINT_ROLE_NOT_CONFIGURED: 'Printer is not configured for this counter.',
  WINDOWS_PRINTER_NOT_FOUND: 'Configured printer is missing in Windows.',
  UNSUPPORTED_COMMAND_LANGUAGE: 'Printer configuration does not match this print type.',
  PRINT_QUEUE_FAILED: 'Windows could not accept the print job.',
  PDF_PRINT_TOOL_NOT_FOUND: 'A4 PDF printing requires SumatraPDF.exe in the print agent folder.',
};

/**
 * Maps a local print agent error/result into a human-readable message
 * for cashier/support-facing UI.
 * @param {{errorCode?: string, errorMessage?: string}|Error} error
 * @returns {string}
 */
export function mapLocalPrintAgentError(error) {
  const errorCode = error?.errorCode;
  if (errorCode && ERROR_MESSAGE_MAP[errorCode]) {
    return ERROR_MESSAGE_MAP[errorCode];
  }
  return error?.errorMessage || error?.message || 'Local Print Agent is not running on this machine.';
}

export { LOCAL_PRINT_AGENT_BASE_URL, HEALTH_TIMEOUT_MS, PRINT_TIMEOUT_MS };

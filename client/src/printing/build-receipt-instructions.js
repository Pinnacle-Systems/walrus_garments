/**
 * Converts POS invoice print data into generic receipt print instructions
 * for the local print agent. Web POS never sends raw ESC/POS commands —
 * the agent translates these generic instructions into ESC/POS itself.
 *
 * Mirrors today's browser print behavior:
 *  - "full" mirrors PosMultiCopyPrint.jsx / generateDosReceiptText (POsDosPrinter.jsx)
 *  - "summarySlip" mirrors PosDeliveryReceiptPrint.jsx
 */

/**
 * @typedef {Object} TextInstruction
 * @property {'text'} type
 * @property {string} value
 * @property {'left'|'center'|'right'} [align]
 * @property {boolean} [bold]
 * @property {boolean} [underline]
 * @property {'normal'|'double-width'|'double-height'|'double'} [size]
 */

/**
 * @typedef {Object} LineInstruction
 * @property {'line'} type
 */

/**
 * @typedef {Object} FeedInstruction
 * @property {'feed'} type
 * @property {number} [lines]
 */

/**
 * @typedef {Object} CutInstruction
 * @property {'cut'} type
 */

/**
 * @typedef {Object} LeftRightInstruction
 * @property {'leftRight'} type
 * @property {string} left
 * @property {string} right
 * @property {boolean} [bold]
 */

/**
 * @typedef {Object} BlankInstruction
 * @property {'blank'} type
 * @property {number} [lines]
 */

/**
 * @typedef {Object} OpenDrawerInstruction
 * @property {'openDrawer'} type
 */

/**
 * @typedef {Object} BarcodeInstruction
 * @property {'barcode'} type
 * @property {string} value
 */

/**
 * @typedef {Object} QrInstruction
 * @property {'qr'} type
 * @property {string} value
 * @property {number} [size]
 * @property {'L'|'M'|'Q'|'H'} [errorCorrection]
 * @property {'left'|'center'|'right'} [align]
 */

/**
 * @typedef {TextInstruction|LineInstruction|FeedInstruction|CutInstruction|LeftRightInstruction|BlankInstruction|OpenDrawerInstruction|BarcodeInstruction|QrInstruction} ReceiptInstruction
 */

/**
 * Determines whether an openDrawer instruction should be included.
 * This is intentionally not tied to the POS user profile — cash drawer
 * behavior must be explicitly opted into via options.openCashDrawer,
 * and only ever applies to the "full" receipt variant (callers must not
 * invoke this for the summarySlip variant).
 * @param {Object} printPayload
 * @param {Object} [options]
 * @param {boolean} [options.openCashDrawer]
 * @returns {boolean}
 */
export function shouldOpenCashDrawer(printPayload, options = {}) {
  if (!options.openCashDrawer) return false;
  const cash = parseFloat(printPayload?.payments?.cash || 0);
  return cash > 0;
}

function buildFullReceiptInstructions(printPayload, options = {}) {
  const {
    docId,
    date,
    customerData,
    items = [],
    payments = { cash: 0, upi: 0, card: 0 },
    summary = { subtotal: 0, tax: 0, discount: 0, total: 0 },
    branchData,
    returnReferences = [],
  } = printPayload || {};

  /** @type {ReceiptInstruction[]} */
  const instructions = [];

  instructions.push({ type: 'text', value: branchData?.branchName || 'WALRUS', align: 'center', bold: true });
  if (branchData?.address) {
    instructions.push({ type: 'text', value: branchData.address, align: 'center' });
  }
  instructions.push({
    type: 'text',
    value: `Ph No.: ${branchData?.phone || branchData?.contactMobile?.toString() || branchData?.contactPersonNumber || '9159477722'}`,
    align: 'center',
  });
  if (branchData?.gstNo) {
    instructions.push({ type: 'text', value: `GSTIN: ${branchData.gstNo}`, align: 'center', bold: true });
  }

  instructions.push({ type: 'text', value: 'TAX INVOICE', align: 'center', bold: true, underline: true });

  instructions.push({ type: 'text', value: (customerData?.name || 'WALK-IN CUSTOMER').toUpperCase(), bold: true });
  if (customerData?.contactPersonNumber) {
    instructions.push({ type: 'text', value: customerData.contactPersonNumber.toString(), bold: true });
  }
  instructions.push({ type: 'text', value: `# ${docId}`, align: 'right' });
  if (returnReferences?.length > 0) {
    instructions.push({ type: 'text', value: `Against: ${returnReferences.join(', ')}`, align: 'right', bold: true });
  }
  instructions.push({ type: 'text', value: `Date : ${formatDateTime(date)}`, align: 'right', bold: true });

  instructions.push({ type: 'line' });
  instructions.push({ type: 'leftRight', left: 'Item', right: 'Qty     Rate     Amt', bold: true });
  instructions.push({ type: 'line' });

  let totalQty = 0;
  items.forEach((item) => {
    const qty = parseFloat(item.qty || 0);
    const rate = parseFloat(item.price || item.rate || 0);
    const rowTotal = qty * rate;
    totalQty += qty;

    let name = item?.Item?.name || item?.itemName || '';
    if (item?.isReturn) name += ' [RETURN]';
    if (item?.isExchangeItem || item?.isAddedDuringExchange) name += ' [EXCHANGE]';

    // One row per item: name on the left, qty/rate/amount on the right.
    // padStart widths (3/9/8 = 20 chars) mirror the 'Qty     Rate     Amt'
    // header above so each number right-aligns under its column. The agent
    // truncates the name if it can't fit next to the numbers.
    const qtyRateAmt =
      `${qty}`.padStart(3) + rate.toFixed(0).padStart(9) + rowTotal.toFixed(0).padStart(8);
    instructions.push({ type: 'leftRight', left: name || ' ', right: qtyRateAmt, bold: true });

    const hasSize = item?.Size?.name || item?.sizeName;
    const hasColor = item?.Color?.name || item?.colorName;
    if (hasSize || hasColor) {
      instructions.push({ type: 'text', value: [hasSize, hasColor].filter(Boolean).join(' | ') });
    }
  });

  instructions.push({ type: 'line' });
  instructions.push({ type: 'leftRight', left: 'Total Items:', right: `${items.length} (Qty: ${totalQty})` });

  if (summary.subtotal > 0) {
    instructions.push({ type: 'leftRight', left: 'Subtotal (Excl. Tax) :', right: summary.subtotal.toFixed(2) });
  }

  if (summary.tax > 0) {
    const halfTax = (summary.tax / 2).toFixed(2);
    instructions.push({ type: 'leftRight', left: 'CGST :', right: halfTax });
    instructions.push({ type: 'leftRight', left: 'SGST :', right: halfTax });
  }

  if (summary.discount > 0) {
    instructions.push({ type: 'leftRight', left: 'Discount :', right: `-${summary.discount.toFixed(2)}` });
  }

  instructions.push({
    type: 'leftRight',
    left: 'Grand Total :',
    right: `Rs. ${summary.total.toFixed(0)}`,
    bold: true,
  });

  instructions.push({ type: 'line' });
  instructions.push({ type: 'text', value: 'PAYMENT BREAKDOWN', bold: true, underline: true });
  if (payments.cash > 0) {
    instructions.push({ type: 'leftRight', left: 'Cash Paid :', right: payments.cash.toFixed(2) });
  }
  if (payments.upi > 0) {
    instructions.push({ type: 'leftRight', left: 'UPI / GPay :', right: payments.upi.toFixed(2) });
  }
  if (payments.card > 0) {
    instructions.push({ type: 'leftRight', left: 'Card Paid :', right: payments.card.toFixed(2) });
  }
  instructions.push({ type: 'line' });

  instructions.push({ type: 'blank' });
  instructions.push({ type: 'text', value: 'Strictly No Return/Exchange of Discounted items.', align: 'center' });
  instructions.push({ type: 'text', value: 'One Day Exchange On Size Issues', align: 'center' });
  instructions.push({ type: 'text', value: 'No Exchange On Inners', align: 'center' });
  instructions.push({ type: 'text', value: 'THANK YOU!', align: 'center', bold: true });
  instructions.push({ type: 'text', value: 'Visit Again', align: 'center' });

  if (shouldOpenCashDrawer(printPayload, options)) {
    instructions.push({ type: 'openDrawer' });
  }

  instructions.push({ type: 'feed', lines: 3 });
  instructions.push({ type: 'cut' });

  return instructions;
}

function buildSummarySlipInstructions(printPayload) {
  const { docId, date, items = [] } = printPayload || {};

  const totalQty = items.reduce((acc, item) => acc + parseFloat(item.qty || 0), 0);

  /** @type {ReceiptInstruction[]} */
  const instructions = [
    { type: 'text', value: 'BILL SUMMARY SLIP', align: 'center', bold: true },
    { type: 'line' },
    { type: 'text', value: docId, align: 'center', bold: true, size: 'double' },
    { type: 'qr', value: docId, align: 'center' },
    { type: 'text', value: 'Total Quantity', align: 'center' },
    { type: 'text', value: `${totalQty}`, align: 'center', bold: true, size: 'double' },
    { type: 'blank' },
    { type: 'text', value: formatDateTime(date), align: 'center' },
    { type: 'feed', lines: 3 },
    { type: 'cut' },
  ];

  return instructions;
}

function formatDateTime(date) {
  const d = date ? new Date(date) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Builds generic receipt print instructions from a POS printPayload.
 * @param {Object} printPayload - Same shape built in POSSession.jsx after invoice save.
 * @param {Object} [options]
 * @param {'full'|'summarySlip'} [options.variant='full']
 * @param {boolean} [options.openCashDrawer=false]
 * @returns {ReceiptInstruction[]}
 */
export function buildReceiptInstructions(printPayload, options = {}) {
  const variant = options.variant || 'full';

  if (variant === 'summarySlip') {
    return buildSummarySlipInstructions(printPayload);
  }

  return buildFullReceiptInstructions(printPayload, options);
}

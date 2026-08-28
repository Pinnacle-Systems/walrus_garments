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
    dataObj,
    docId,
    date,
    customerData,
    items = [],
    payments = { cash: 0, upi: 0, card: 0, online: 0 },
    summary = { subtotal: 0, tax: 0, discount: 0, total: 0 },
    branchData,
    returnReferences = [],
  } = printPayload || {};

  function formatDateTime(date) {
    const d = date ? new Date(date) : new Date();
    const pad = (n) => String(n).padStart(2, '0');

    const hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;

    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(formattedHours)}:${pad(d.getMinutes())} ${ampm}`;
  }


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
  instructions.push({ type: 'text', value: '# Item Name', bold: true });
  instructions.push({ type: 'leftRight', left: '  Qty             Price', right: 'Amount', bold: true });
  instructions.push({ type: 'line' });

  const returnTotal = items.reduce((acc, item) => item.isReturn ? acc + (parseFloat(item.price || item.rate || 0) * parseFloat(item.qty || 0)) : acc, 0);
  const purchaseTotal = items.reduce((acc, item) => !item.isReturn ? acc + (parseFloat(item.price || item.rate || 0) * parseFloat(item.qty || 0)) : acc, 0);
  const totalOfferReversal = items.reduce((acc, item) => acc + (parseFloat(item.offerReversal) || 0), 0);
  const totalOfferReapplied = items.reduce((acc, item) => acc + (parseFloat(item.offerReapplied) || 0), 0);
  const overallPurchaseTotal = purchaseTotal - totalOfferReversal + totalOfferReapplied;
  const overallPurchaseTotalNew = (purchaseTotal + totalOfferReversal) - (totalOfferReapplied + returnTotal);

  let totalQty = 0;
  items.forEach((item, index) => {
    const qty = parseFloat(item.qty || 0);
    const rate = parseFloat(item.price || item.rate || 0);
    const rowTotal = qty * rate;
    totalQty += !item.isReturn ? qty : 0;

    let name = item?.Item?.name || item?.itemName || '';
    if (item?.isReturn) name += ' [RETURN]';
    if (item?.isExchangeItem) name += ' [EXCHANGE]';


    instructions.push({ type: 'text', value: `${index + 1} ${name || ' '}`, bold: true });


    const hasSize = item?.Size?.name || item?.sizeName;
    const hasColor = item?.Color?.name || item?.colorName;
    if (hasSize || hasColor) {
      const descriptors = [hasSize && `${hasSize} Size`, hasColor && `${hasColor} Color`].filter(Boolean);
      instructions.push({ type: 'text', value: descriptors.join(', ') });
    }

    const qtyStr = `  ${qty}Pcs`.padEnd(18, ' ');
    const priceStr = rate.toFixed(2);

    instructions.push({
      type: 'leftRight',
      left: `${qtyStr}${priceStr}`,
      right: rowTotal.toFixed(2),
    });

    if (index < items.length - 1) {
      instructions.push({ type: 'blank' });
    }
  });

  instructions.push({ type: 'line' });

  if (dataObj?.availableCredit && returnTotal < overallPurchaseTotal) {
    const creditAppliedVal = Math.min(Math.max(0, overallPurchaseTotal), dataObj.availableCredit);
    instructions.push({
      type: 'leftRight',
      left: 'Credit Applied :',
      right: `Rs. ${creditAppliedVal}`,
      bold: true,
    });
  }

  instructions.push({
    type: 'text',
    value: `Total Qty: ${totalQty}`
  });
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

  if (returnTotal > 0) {
    instructions.push({ type: 'leftRight', left: 'Return Amount :', right: returnTotal.toFixed(2) });
  }

  if (totalOfferReversal && totalOfferReapplied && totalOfferReversal !== totalOfferReapplied) {
    instructions.push({ type: 'leftRight', left: 'Offer Reversal :', right: totalOfferReversal.toFixed(2) });
    instructions.push({ type: 'leftRight', left: 'Offer Restored :', right: `-${totalOfferReapplied.toFixed(2)}` });
  } else if (totalOfferReversal && !totalOfferReapplied) {
    instructions.push({ type: 'leftRight', left: 'Offer Reversal :', right: totalOfferReversal.toFixed(2) });
  } else if (totalOfferReapplied && !totalOfferReversal) {
    instructions.push({ type: 'leftRight', left: 'Offer Restored :', right: `-${totalOfferReapplied.toFixed(2)}` });
  }

  if (returnTotal > 0 && purchaseTotal > 0) {
    instructions.push({ type: 'leftRight', left: 'New Purchase :', right: purchaseTotal.toFixed(2) });
  }


  if (dataObj?.courierCharges && dataObj?.courierCharges > 0) {
    instructions.push({ type: 'leftRight', left: 'Courier Charges :', right: dataObj.courierCharges.toFixed(2) });
  }
  if (dataObj?.deliveryCharges && dataObj?.deliveryCharges > 0) {
    instructions.push({ type: 'leftRight', left: 'Delivery Charges :', right: dataObj.deliveryCharges.toFixed(2) });
  }
  if (dataObj?.shippingCharges && dataObj?.shippingCharges > 0) {
    instructions.push({ type: 'leftRight', left: 'Shipping Charges :', right: dataObj.shippingCharges.toFixed(2) });
  }


  let totalLabel = '';
  if (returnTotal > overallPurchaseTotal) {
    totalLabel = 'Store Credit Issued :';
  } else if (returnTotal <= overallPurchaseTotal) {
    if (dataObj?.availableCredit < overallPurchaseTotal) {
      totalLabel = 'Total Payable :';
    } else {
      totalLabel = 'Grand Total :';
    }
  }

  const numericTotal = parseFloat(summary.total || 0);
  let totalAmountVal = '';
  if (numericTotal > 0) {
    totalAmountVal = numericTotal.toFixed(0);
  } else if (overallPurchaseTotalNew > 0) {
    totalAmountVal = overallPurchaseTotalNew.toFixed(2);
  } else {
    totalAmountVal = Math.abs(purchaseTotal - returnTotal).toFixed(2);
  }

  if (totalLabel) {
    instructions.push({
      type: 'leftRight',
      left: totalLabel,
      right: `Rs. ${totalAmountVal}`,
      bold: true,
    });
  }

  if (returnTotal > overallPurchaseTotal) {
    instructions.push({
      type: 'leftRight',
      left: "Total Payable",
      right: `Rs. 0.00`,
      bold: true,
    });
  }


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
  if (payments.online > 0) {
    instructions.push({ type: 'leftRight', left: 'Online Paid :', right: payments.online.toFixed(2) });
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
  const { docId, date, items = [], summary } = printPayload || {};

  const totalQty = items.filter((i) => !i.isReturn).reduce((acc, item) => acc + parseFloat(item.qty || 0), 0);
  const billValue = parseFloat(summary?.total > 0 ? summary?.total : 0).toFixed(2);

  const time = formatDateTime(date);

  /** @type {ReceiptInstruction[]} */
  const instructions = [
    { type: 'text', value: 'BILL SUMMARY SLIP', align: 'center', bold: true },
    { type: 'line' },
    { type: 'text', value: docId, align: 'center', bold: true, size: 'double' },
    { type: 'qr', value: docId, align: 'center' },
    { type: 'leftRight', left: 'Total Quantity', right: 'Bill Value', bold: true },
    { type: 'leftRight', left: `${totalQty}`, right: `${billValue}`, bold: true, size: 'double' },
    { type: 'blank' },
    { type: 'text', value: `Time : ${time}`, align: 'center' },
    { type: 'feed', lines: 3 },
    { type: 'cut' },
  ];

  return instructions;
}

// function formatDateTime(date) {
//   const d = date ? new Date(date) : new Date();
//   const pad = (n) => String(n).padStart(2, '0');
//   return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
// }

function formatDateTime(date) {
  const d = date ? new Date(date) : new Date();
  const pad = (n) => String(n).padStart(2, '0');

  const hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(formattedHours)}:${pad(d.getMinutes())} ${ampm}`;
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

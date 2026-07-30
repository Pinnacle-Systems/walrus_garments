/**
 * Converts Sales module print data into generic receipt print instructions
 * for the local print agent.
 */

function formatDateTime(date) {
  const d = date ? new Date(date) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Builds generic receipt print instructions for Sales Module.
 * @param {Object} printPayload
 * @returns {Array}
 */
export function buildSalesReceiptInstructions(printPayload) {
  const {
    docId,
    date,
    customerData,
    items = [],
    summary = {
      subtotal: 0,
      tax: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      packingCharge: 0,
      shippingCharge: 0,
      courierCharge: 0,
      roundOff: 0
    },
    advanceAmount,
    advanceReceivedAmount,
    branchData,
    title = 'SALES INVOICE'
  } = printPayload || {};

  console.log(items, "items")
  console.log(customerData, "customerData")

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

  instructions.push({ type: 'text', value: title, align: 'center', bold: true, underline: true });

  instructions.push({ type: 'text', value: (customerData?.name || 'CASH').toUpperCase(), bold: true });
  if (customerData?.contactPersonNumber || customerData?.phone) {
    instructions.push({ type: 'text', value: (customerData?.contactPersonNumber || customerData?.phone).toString(), bold: true });
  }
  if (customerData?.gstNo) {
    instructions.push({ type: 'text', value: `GST: ${customerData.gstNo}`, bold: true });
  }

  instructions.push({ type: 'text', value: `# ${docId}`, align: 'right' });
  instructions.push({ type: 'text', value: `Date : ${formatDateTime(date)}`, align: 'right', bold: true });

  instructions.push({ type: 'line' });
  instructions.push({ type: 'text', value: '# S.No Name', bold: true });
  instructions.push({ type: 'leftRight', left: '  Qty             Price', right: 'Amount', bold: true });
  instructions.push({ type: 'line' });

  let totalQty = 0;
  items.forEach((item, index) => {
    const qty = parseFloat(item.qty || 0);
    const rate = parseFloat(item.price || item.rate || 0);
    const rowTotal = qty * rate;
    totalQty += qty;

    let name = item?.itemName || item?.itemName || '';

    // In Sales module, size and color are appended if present
    const sizeName = item?.Size?.name || item?.sizeName;
    const colorName = item?.Color?.name || item?.colorName;
    if (sizeName) name += ` ${sizeName}`;
    if (colorName) name += ` ${colorName}`;

    instructions.push({ type: 'text', value: `${index + 1} ${name || ' '}`, bold: true });

    if (item.hsnCode) {
      instructions.push({ type: 'text', value: `HSN: ${item.hsnCode}` });
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
  instructions.push({ type: 'leftRight', left: 'Total Items:', right: `${items.length} (Qty: ${totalQty})` });

  if (summary.subtotal > 0) {
    instructions.push({ type: 'leftRight', left: 'Taxable Amount :', right: summary.subtotal.toFixed(2) });
  }

  if (summary.igst > 0) {
    instructions.push({ type: 'leftRight', left: 'IGST :', right: summary.igst.toFixed(2) });
    // } else {
    //   if (summary.cgst > 0) {
    //     instructions.push({ type: 'leftRight', left: 'CGST :', right: summary.cgst.toFixed(2) });
    //   }
    //   if (summary.sgst > 0) {
    //     instructions.push({ type: 'leftRight', left: 'SGST :', right: summary.sgst.toFixed(2) });
    //   }
  }

  if (summary.tax > 0) {
    instructions.push({ type: 'leftRight', left: 'Tax Amount :', right: summary.tax.toFixed(2) });
  }

  if (summary.packingCharge > 0) {
    instructions.push({ type: 'leftRight', left: 'Packing Charge :', right: summary.packingCharge.toFixed(2) });
  }
  if (summary.shippingCharge > 0) {
    instructions.push({ type: 'leftRight', left: 'Shipping Charge :', right: summary.shippingCharge.toFixed(2) });
  }
  if (summary.courierCharge > 0) {
    instructions.push({ type: 'leftRight', left: 'Courier Charge :', right: summary.courierCharge.toFixed(2) });
  }

  if (summary.roundOff !== 0 && summary.roundOff !== undefined && !isNaN(summary.roundOff)) {
    instructions.push({ type: 'leftRight', left: 'Round Off :', right: summary.roundOff.toFixed(2) });
  }

  instructions.push({ type: 'line' });
  instructions.push({
    type: 'leftRight',
    left: 'NET TOTAL :',
    right: `Rs. ${summary.total.toFixed(2)}`,
    bold: true,
  });

  const advAmt = parseFloat(advanceAmount || summary?.advanceAmount || advanceReceivedAmount || 0);
  if (advAmt && advAmt > 0) {
    const netAmt = parseFloat(summary.total || summary.netAmount || 0);
    instructions.push({
      type: 'leftRight',
      left: 'Advance Amount :',
      right: `Rs. ${advAmt.toFixed(2)}`,
      bold: true,
    });
    instructions.push({
      type: 'leftRight',
      left: 'Balance Amount :',
      right: `Rs. ${(netAmt - advAmt).toFixed(2)}`,
      bold: true,
    });
  }

  instructions.push({ type: 'line' });

  instructions.push({ type: 'blank' });
  instructions.push({ type: 'text', value: 'Strictly No Return/Exchange of Discounted items.', align: 'center' });
  instructions.push({ type: 'text', value: 'One Day Exchange On Size Issues', align: 'center' });
  instructions.push({ type: 'text', value: 'No Exchange On Inners', align: 'center' });
  instructions.push({ type: 'text', value: 'THANK YOU!', align: 'center', bold: true });
  instructions.push({ type: 'text', value: 'Visit Again', align: 'center' });

  instructions.push({ type: 'feed', lines: 3 });
  instructions.push({ type: 'cut' });

  return instructions;
}

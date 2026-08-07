/**
 * Converts Payment Detail print data into generic ESC/POS receipt print instructions
 * for the local print agent.
 */

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Builds generic receipt print instructions for Payment Detail (Receipts & Vouchers).
 * @param {Object} paymentData
 * @param {Object} [branchData]
 * @returns {Array} List of ESC/POS instructions for PrintAgent
 */
export function buildPaymentReceiptInstructions(paymentData, branchData) {
  if (!paymentData) return [];

  const {
    docId,
    cvv,
    paidAmount,
    paymentMode,
    paymentFlow,
    refDocId,
    Party,
    paymentRefNo
  } = paymentData;

  const title = paymentFlow === "Receipt" ? "PAYMENT RECEIPT" : "PAYMENT VOUCHER";
  const partyLabel = paymentFlow === "Receipt" ? "Received From:" : "Paid To:";
  const amountLabel = paymentFlow === "Receipt" ? "AMOUNT RECEIVED:" : "AMOUNT PAID:";

  const instructions = [];

  // 1. Branch Header
  instructions.push({ type: 'text', value: branchData?.branchName || 'WALRUS', align: 'center', bold: true });
  if (branchData?.address) {
    instructions.push({ type: 'text', value: branchData.address, align: 'center' });
  }
  const phoneNo = branchData?.phone || branchData?.contactMobile?.toString() || branchData?.contactPersonNumber;
  if (phoneNo) {
    instructions.push({
      type: 'text',
      value: `Ph No.: ${phoneNo}`,
      align: 'center',
    });
  }
  if (branchData?.gstNo) {
    instructions.push({ type: 'text', value: `GSTIN: ${branchData.gstNo}`, align: 'center', bold: true });
  }

  // 2. Title & Metadata Header
  instructions.push({ type: 'blank', lines: 1 });
  instructions.push({ type: 'text', value: title, align: 'center', bold: true, underline: true });
  instructions.push({ type: 'line' });
  instructions.push({
    type: 'leftRight',
    left: `NO: ${docId || '-'}`,
    right: `Date: ${formatDate(cvv)}`,
    bold: true
  });
  instructions.push({ type: 'line' });

  // 3. Transaction Details Key-Values
  instructions.push({
    type: 'leftRight',
    left: partyLabel,
    right: Party?.name || 'N/A',
    bold: true
  });

  instructions.push({
    type: 'leftRight',
    left: 'Against Doc:',
    right: refDocId || '-'
  });

  instructions.push({
    type: 'leftRight',
    left: 'Payment Mode:',
    right: paymentMode || '-'
  });

  if (paymentRefNo) {
    instructions.push({
      type: 'leftRight',
      left: 'Ref No:',
      right: paymentRefNo
    });
  }

  instructions.push({ type: 'line' });

  // 4. Amount Summary Section
  const amountVal = parseFloat(paidAmount || 0).toFixed(2);
  instructions.push({
    type: 'leftRight',
    left: amountLabel,
    right: `Rs. ${amountVal}`,
    bold: true
  });

  instructions.push({ type: 'line' });

  // 5. Footer & Signatures
  instructions.push({ type: 'blank', lines: 1 });
  instructions.push({ type: 'text', value: 'THANK YOU!', align: 'center', bold: true });
  instructions.push({ type: 'blank', lines: 2 });
  instructions.push({ type: 'text', value: 'Authorized Signatory', align: 'center' });
  instructions.push({ type: 'blank', lines: 1 });
  instructions.push({ type: 'text', value: 'Printed via Walrus ERP System', align: 'center' });
  instructions.push({ type: 'blank', lines: 2 });
  instructions.push({ type: 'cut' });

  return instructions;
}

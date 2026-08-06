/**
 * Converts Expense Entry print data into generic receipt print instructions
 * for the local print agent.
 */

function formatDateTime(date) {
  const d = date ? new Date(date) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function findFromList(id, list, key) {
  if (!id || !list || !Array.isArray(list)) return "";
  const item = list.find(l => parseInt(l.id) === parseInt(id));
  return item ? (item[key] || item.name || item.categoryName || "") : "";
}

/**
 * Builds generic receipt print instructions for Expense Entry.
 * @param {Object} printPayload
 * @returns {Array}
 */
export function buildExpenseReceiptInstructions(printPayload) {
  const {
    docId,
    date,
    expenseItems = [],
    expenseTypeList = [],
    branchData,
    remarks,
    title = 'EXPENSE VOUCHER'
  } = printPayload || {};

  const instructions = [];

  // 1. Branch Header
  instructions.push({ type: 'text', value: branchData?.branchName || 'WALRUS', align: 'center', bold: true });
  if (branchData?.address) {
    instructions.push({ type: 'text', value: branchData.address, align: 'center' });
  }
  if (branchData?.phone || branchData?.contactMobile || branchData?.contactPersonNumber) {
    instructions.push({
      type: 'text',
      value: `Ph No.: ${branchData?.phone || branchData?.contactMobile?.toString() || branchData?.contactPersonNumber}`,
      align: 'center',
    });
  }
  if (branchData?.gstNo) {
    instructions.push({ type: 'text', value: `GSTIN: ${branchData.gstNo}`, align: 'center', bold: true });
  }

  // 2. Title & Metadata
  instructions.push({ type: 'text', value: title, align: 'center', bold: true, underline: true });
  instructions.push({ type: 'leftRight', left: `No: ${docId || 'New'}`, right: `Date: ${formatDateTime(date)}`, bold: true });

  instructions.push({ type: 'line' });
  instructions.push({ type: 'leftRight', left: '#  Category / Description', right: 'Amount', bold: true });
  instructions.push({ type: 'line' });

  // 3. Expense Items Table
  let totalAmount = 0;
  const filteredItems = expenseItems.filter(i => i && (i.expenseCategoryId || i.amount));

  filteredItems.forEach((item, index) => {
    const amt = parseFloat(item.amount || 0);
    totalAmount += amt;

    const catName = item.expenseCategoryName || item.categoryName || findFromList(item.expenseCategoryId, expenseTypeList, 'name') || 'General Expense';
    const priceStr = `Rs. ${amt.toFixed(2)}`;

    // Category Name & Amount on main line
    instructions.push({
      type: 'leftRight',
      left: `${index + 1}. ${catName}`,
      right: priceStr,
      bold: true
    });

    // Indented description on sub-line for clean text wrapping
    if (item.description && item.description.trim()) {
      instructions.push({
        type: 'text',
        value: `   (${item.description.trim()})`
      });
    }
  });

  instructions.push({ type: 'line' });

  // 4. Totals Summary
  instructions.push({
    type: 'leftRight',
    left: 'TOTAL EXPENSE:',
    right: `Rs. ${totalAmount.toFixed(2)}`,
    bold: true
  });

  // 5. Remarks & Footer Signature
  if (remarks) {
    instructions.push({ type: 'blank', lines: 1 });
    instructions.push({ type: 'text', value: `Remarks: ${remarks}` });
  }

  instructions.push({ type: 'blank', lines: 2 });
  instructions.push({ type: 'leftRight', left: 'Prepared By: ________', right: 'Authorized Sign: ________' });
  instructions.push({ type: 'blank', lines: 2 });
  instructions.push({ type: 'cut' });

  return instructions;
}

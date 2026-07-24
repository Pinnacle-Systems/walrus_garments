import { buildReceiptInstructions, shouldOpenCashDrawer } from './build-receipt-instructions';

const basePrintPayload = {
  docId: 'INV-1001',
  date: '2026-07-05T10:00:00.000Z',
  customerData: { name: 'John Doe', contactPersonNumber: '9999999999' },
  items: [
    { itemName: 'T-Shirt', qty: 2, price: 500, sizeName: 'M', colorName: 'Red' },
    { itemName: 'Jeans', qty: 1, price: 1200 },
  ],
  payments: { cash: 1500, upi: 700, card: 0 },
  summary: { subtotal: 1900, tax: 300, discount: 100, total: 2200 },
  branchData: { branchName: 'Walrus Garments - MG Road', address: '123 MG Road', gstNo: '29ABCDE1234F1Z5' },
  returnReferences: [],
};

describe('buildReceiptInstructions - full variant', () => {
  it('includes item rows, totals, and payment breakdown instructions', () => {
    const instructions = buildReceiptInstructions(basePrintPayload, { variant: 'full' });

    expect(instructions.some((i) => i.type === 'text' && i.value === 'T-Shirt' && i.bold)).toBe(true);
    expect(instructions.some((i) => i.type === 'text' && i.value === 'Jeans' && i.bold)).toBe(true);
    expect(instructions.some((i) => i.type === 'leftRight' && i.left === 'Grand Total :')).toBe(true);
    expect(instructions.some((i) => i.type === 'leftRight' && i.left === 'Cash Paid :')).toBe(true);
    expect(instructions.some((i) => i.type === 'leftRight' && i.left === 'UPI / GPay :')).toBe(true);
    expect(instructions.some((i) => i.type === 'feed')).toBe(true);
    expect(instructions.some((i) => i.type === 'cut')).toBe(true);
  });

  it('prints a two-row "Item" / "Qty Rate Amount" header before the item list', () => {
    const instructions = buildReceiptInstructions(basePrintPayload, { variant: 'full' });

    const itemHeaderIndex = instructions.findIndex((i) => i.type === 'text' && i.value === 'Item');
    expect(itemHeaderIndex).toBeGreaterThan(-1);
    expect(instructions[itemHeaderIndex].bold).toBe(true);

    const columnsHeader = instructions[itemHeaderIndex + 1];
    expect(columnsHeader.type).toBe('text');
    expect(columnsHeader.bold).toBe(true);
    expect(columnsHeader.value).toMatch(/^Qty\s+Rate\s+Amount$/);

    // Header sits between separator lines, ahead of the first item name.
    expect(instructions[itemHeaderIndex - 1]).toEqual({ type: 'line' });
    expect(instructions[itemHeaderIndex + 2]).toEqual({ type: 'line' });
    const shirtIndex = instructions.findIndex((i) => i.type === 'text' && i.value === 'T-Shirt');
    expect(shirtIndex).toBeGreaterThan(itemHeaderIndex + 2);
  });

  it('prints the item name on its own bold line, size/color next, then qty/rate/amount', () => {
    const instructions = buildReceiptInstructions(basePrintPayload, { variant: 'full' });

    const shirtIndex = instructions.findIndex((i) => i.type === 'text' && i.value === 'T-Shirt');
    expect(shirtIndex).toBeGreaterThan(-1);
    expect(instructions[shirtIndex].bold).toBe(true);

    // Size/color line immediately follows the name, formatted as
    // "<size> Size, <color> Color".
    expect(instructions[shirtIndex + 1]).toEqual({ type: 'text', value: 'M Size, Red Color' });

    // Values row is a plain (non-bold) 'text' line - not 'leftRight' - so
    // the agent's word-wrap only ever breaks at spaces, meaning the
    // Qty/Rate/Amount numbers can never be truncated mid-value the way
    // leftRight's left-side truncation could on narrow paper (see the
    // comment in build-receipt-instructions.js).
    const shirtValues = instructions[shirtIndex + 2];
    expect(shirtValues).toEqual({ type: 'text', value: '2            500.00        1000.00' });
    expect(shirtValues.bold).toBeUndefined();

    // Jeans has no size/color, so its values row follows the name directly.
    const jeansIndex = instructions.findIndex((i) => i.type === 'text' && i.value === 'Jeans');
    expect(instructions[jeansIndex + 1]).toEqual({ type: 'text', value: '1            1200.00       1200.00' });

    // No standalone right-aligned qty/rate/amt text rows remain.
    expect(instructions.some((i) => i.type === 'text' && i.align === 'right' && /^\d+\s{5}\d+\s{5}\d+$/.test(i.value || ''))).toBe(false);
  });

  it('separates consecutive items with a blank line, without a blank after the last item', () => {
    const instructions = buildReceiptInstructions(basePrintPayload, { variant: 'full' });

    const shirtIndex = instructions.findIndex((i) => i.type === 'text' && i.value === 'T-Shirt');
    // name, size/color, values, blank
    expect(instructions[shirtIndex + 3]).toEqual({ type: 'blank' });

    const jeansIndex = instructions.findIndex((i) => i.type === 'text' && i.value === 'Jeans');
    // name, values, then straight into the closing separator line (no size/color, no trailing blank).
    expect(instructions[jeansIndex + 2]).toEqual({ type: 'line' });
  });

  it('does not include openDrawer by default', () => {
    const instructions = buildReceiptInstructions(basePrintPayload, { variant: 'full' });
    expect(instructions.some((i) => i.type === 'openDrawer')).toBe(false);
  });

  it('does not include openDrawer when openCashDrawer option is omitted', () => {
    const instructions = buildReceiptInstructions(basePrintPayload, { variant: 'full', openCashDrawer: false });
    expect(instructions.some((i) => i.type === 'openDrawer')).toBe(false);
  });

  it('includes openDrawer only when openCashDrawer is true and cash collection is positive', () => {
    const instructions = buildReceiptInstructions(basePrintPayload, { variant: 'full', openCashDrawer: true });
    expect(instructions.some((i) => i.type === 'openDrawer')).toBe(true);
  });

  it('does not include openDrawer when openCashDrawer is true but there is no cash collection', () => {
    const noCashPayload = { ...basePrintPayload, payments: { cash: 0, upi: 700, card: 0 } };
    const instructions = buildReceiptInstructions(noCashPayload, { variant: 'full', openCashDrawer: true });
    expect(instructions.some((i) => i.type === 'openDrawer')).toBe(false);
  });
});

describe('buildReceiptInstructions - summarySlip variant', () => {
  const unpaidPayload = {
    docId: 'INV-2002',
    date: '2026-07-05T10:00:00.000Z',
    items: [
      { itemName: 'T-Shirt', qty: 2 },
      { itemName: 'Jeans', qty: 3 },
    ],
    payments: { cash: 1000, upi: 0, card: 0 },
  };

  it('includes a bold "BILL SUMMARY SLIP" text instruction', () => {
    const instructions = buildReceiptInstructions(unpaidPayload, { variant: 'summarySlip' });
    expect(instructions.some((i) => i.type === 'text' && i.value === 'BILL SUMMARY SLIP' && i.bold)).toBe(true);
  });

  it('includes a QR instruction with the docId as value', () => {
    const instructions = buildReceiptInstructions(unpaidPayload, { variant: 'summarySlip' });
    const qrInstruction = instructions.find((i) => i.type === 'qr');
    expect(qrInstruction).toBeDefined();
    expect(qrInstruction.value).toBe('INV-2002');
  });

  it('includes total quantity', () => {
    const instructions = buildReceiptInstructions(unpaidPayload, { variant: 'summarySlip' });
    expect(instructions.some((i) => i.type === 'text' && i.value === '5')).toBe(true);
  });

  it('does not include item rows', () => {
    const instructions = buildReceiptInstructions(unpaidPayload, { variant: 'summarySlip' });
    const values = instructions.map((i) => i.value).filter(Boolean);
    expect(values.some((v) => v.includes('T-Shirt'))).toBe(false);
    expect(values.some((v) => v.includes('Jeans'))).toBe(false);
  });

  it('does not include totals or payment breakdown', () => {
    const instructions = buildReceiptInstructions(unpaidPayload, { variant: 'summarySlip' });
    expect(instructions.some((i) => i.type === 'leftRight')).toBe(false);
  });

  it('never includes openDrawer, even with openCashDrawer true and positive cash', () => {
    const instructions = buildReceiptInstructions(unpaidPayload, { variant: 'summarySlip', openCashDrawer: true });
    expect(instructions.some((i) => i.type === 'openDrawer')).toBe(false);
  });

  it('is forced to a single copy by the caller (copies is not decided by the builder)', () => {
    // The builder does not decide copy count — POSSession.jsx and PosReportsNew.jsx force copies=1
    // for the summarySlip variant. This test documents the contract at the builder boundary:
    // the builder never emits multiple cut/feed pairs implying multiple copies.
    const instructions = buildReceiptInstructions(unpaidPayload, { variant: 'summarySlip' });
    expect(instructions.filter((i) => i.type === 'cut')).toHaveLength(1);
  });
});

describe('shouldOpenCashDrawer', () => {
  it('returns false when openCashDrawer option is false', () => {
    expect(shouldOpenCashDrawer({ payments: { cash: 500 } }, { openCashDrawer: false })).toBe(false);
  });

  it('returns true only if openCashDrawer is true and there is positive cash collection', () => {
    expect(shouldOpenCashDrawer({ payments: { cash: 500 } }, { openCashDrawer: true })).toBe(true);
  });

  it('returns false if openCashDrawer is true but cash collection is zero', () => {
    expect(shouldOpenCashDrawer({ payments: { cash: 0 } }, { openCashDrawer: true })).toBe(false);
  });
});

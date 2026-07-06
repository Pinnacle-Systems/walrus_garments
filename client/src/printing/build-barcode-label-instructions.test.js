import { buildBarcodeLabelInstructions } from './build-barcode-label-instructions';

describe('buildBarcodeLabelInstructions', () => {
  const labelData = { itemName: 'T-Shirt Red M', price: 599, barcode: '8901234567890' };

  it('emits text and barcode instructions', () => {
    const instructions = buildBarcodeLabelInstructions(labelData);

    expect(instructions.some((i) => i.type === 'text' && i.value === 'T-Shirt Red M')).toBe(true);
    expect(instructions.some((i) => i.type === 'barcode' && i.value === '8901234567890')).toBe(true);
  });

  it('includes the price as a text instruction', () => {
    const instructions = buildBarcodeLabelInstructions(labelData);
    expect(instructions.some((i) => i.type === 'text' && i.value === 'Rs. 599')).toBe(true);
  });

  it('omits the box border by default', () => {
    const instructions = buildBarcodeLabelInstructions(labelData);
    expect(instructions.some((i) => i.type === 'box')).toBe(false);
  });

  it('includes a box border when includeBorder option is true', () => {
    const instructions = buildBarcodeLabelInstructions(labelData, { includeBorder: true });
    expect(instructions.some((i) => i.type === 'box')).toBe(true);
  });

  it('omits the barcode instruction when no barcode value is given', () => {
    const instructions = buildBarcodeLabelInstructions({ itemName: 'No Barcode Item' });
    expect(instructions.some((i) => i.type === 'barcode')).toBe(false);
  });
});

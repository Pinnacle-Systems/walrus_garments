/**
 * Converts POS label data into generic TSPL label print instructions for
 * the local print agent. POS-only scope for this pass — does not touch
 * the independent label-printing modules under EmployeeMaster/StockTransfer/
 * PurchaseInward/ItemMaster (those are follow-up work).
 */

/**
 * @typedef {Object} LabelTextInstruction
 * @property {'text'} type
 * @property {number} x
 * @property {number} y
 * @property {string} value
 * @property {'1'|'2'|'3'|'4'|'5'|'TSS24.BF2'|'TSS16.BF2'} [font]
 * @property {0|90|180|270} [rotation]
 * @property {number} [xMultiplier]
 * @property {number} [yMultiplier]
 */

/**
 * @typedef {Object} LabelBarcodeInstruction
 * @property {'barcode'} type
 * @property {number} x
 * @property {number} y
 * @property {string} value
 * @property {string} [codeType]
 * @property {number} [height]
 * @property {boolean} [readable]
 * @property {0|90|180|270} [rotation]
 */

/**
 * @typedef {Object} LabelBoxInstruction
 * @property {'box'} type
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} [thickness]
 */

/**
 * @typedef {Object} LabelLineInstruction
 * @property {'line'} type
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {LabelTextInstruction|LabelBarcodeInstruction|LabelBoxInstruction|LabelLineInstruction} LabelInstruction
 */

const LABEL_LAYOUT = {
  itemNameX: 20,
  itemNameY: 10,
  priceX: 20,
  priceY: 40,
  barcodeX: 20,
  barcodeY: 70,
  barcodeHeight: 60,
  borderX: 5,
  borderY: 5,
  borderWidth: 390,
  borderHeight: 190,
};

/**
 * Builds generic TSPL label print instructions from POS label data.
 * @param {Object} labelData
 * @param {string} labelData.itemName
 * @param {string|number} labelData.price
 * @param {string} labelData.barcode
 * @param {Object} [options]
 * @param {boolean} [options.includeBorder=false]
 * @returns {LabelInstruction[]}
 */
export function buildBarcodeLabelInstructions(labelData, options = {}) {
  const { itemName = '', price, barcode } = labelData || {};

  /** @type {LabelInstruction[]} */
  const instructions = [];

  if (options.includeBorder) {
    instructions.push({
      type: 'box',
      x: LABEL_LAYOUT.borderX,
      y: LABEL_LAYOUT.borderY,
      width: LABEL_LAYOUT.borderWidth,
      height: LABEL_LAYOUT.borderHeight,
      thickness: 2,
    });
  }

  instructions.push({
    type: 'text',
    x: LABEL_LAYOUT.itemNameX,
    y: LABEL_LAYOUT.itemNameY,
    value: itemName,
    font: 'TSS24.BF2',
  });

  if (price !== undefined && price !== null && price !== '') {
    instructions.push({
      type: 'text',
      x: LABEL_LAYOUT.priceX,
      y: LABEL_LAYOUT.priceY,
      value: `Rs. ${price}`,
      font: 'TSS16.BF2',
    });
  }

  if (barcode) {
    instructions.push({
      type: 'barcode',
      x: LABEL_LAYOUT.barcodeX,
      y: LABEL_LAYOUT.barcodeY,
      value: barcode,
      codeType: '128',
      height: LABEL_LAYOUT.barcodeHeight,
      readable: true,
    });
  }

  return instructions;
}

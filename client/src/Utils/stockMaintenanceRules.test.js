import {
  getConfiguredStockDrivenFields,
  getItemVariantColorOptions,
  getItemVariantSizeOptions,
  getStockMaintenanceConfig,
  resolveBarcodeGenerationMethod,
} from "./stockMaintenanceRules";

describe("stockMaintenanceRules", () => {
  it("falls back to stock-control visibility when no price-list variants exist", () => {
    const sizes = [{ id: 1, name: "S" }, { id: 2, name: "M" }];
    const result = getItemVariantSizeOptions(
      [{ id: 10, ItemPriceList: [{ sizeId: null, colorId: null }] }],
      sizes,
      "sizeId",
      10
    );

    expect(result).toEqual(sizes);
  });

  it("filters size options to configured price-list rows when variants exist", () => {
    const sizes = [{ id: 1, name: "S" }, { id: 2, name: "M" }, { id: 3, name: "L" }];
    const result = getItemVariantSizeOptions(
      [{ id: 10, ItemPriceList: [{ sizeId: 1 }, { sizeId: 3 }] }],
      sizes,
      "sizeId",
      10
    );

    expect(result).toEqual([{ id: 1, name: "S" }, { id: 3, name: "L" }]);
  });

  it("filters color options by selected size when size-color rows exist", () => {
    const colors = [{ id: 7, name: "Red" }, { id: 8, name: "Blue" }];
    const result = getItemVariantColorOptions(
      [{ id: 10, ItemPriceList: [{ sizeId: 1, colorId: 7 }, { sizeId: 2, colorId: 8 }] }],
      colors,
      "colorId",
      10,
      2
    );

    expect(result).toEqual([{ id: 8, name: "Blue" }]);
  });

  it("derives stock-maintenance visibility from stock control instead of barcode generation mode", () => {
    expect(getStockMaintenanceConfig({ itemWise: true, sizeWise: true, sizeColorWise: false })).toEqual({
      trackItem: true,
      trackSize: true,
      trackColor: false,
    });
  });

  it("defaults barcode generation mode to STANDARD", () => {
    expect(resolveBarcodeGenerationMethod(undefined)).toBe("STANDARD");
  });

  it("returns configured stock-driven fields in field order", () => {
    expect(
      getConfiguredStockDrivenFields({
        field2: "Shade",
        field7: "Batch",
        field10: "Bin",
      })
    ).toEqual([
      expect.objectContaining({ key: "field2", label: "Shade", required: true }),
      expect.objectContaining({ key: "field7", label: "Batch", required: true }),
      expect.objectContaining({ key: "field10", label: "Bin", required: true }),
    ]);
  });
});

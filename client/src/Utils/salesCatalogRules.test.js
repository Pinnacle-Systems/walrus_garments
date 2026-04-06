import {
  areSalesRowsValid,
  getCatalogColorOptions,
  getCatalogColumnVisibility,
  getCatalogSizeOptions,
  resolveSellablePriceRow,
} from "./salesCatalogRules";

const items = [
  {
    id: 1,
    name: "CANONICAL_SIZE_COLOR",
    isLegacy: false,
  },
  {
    id: 2,
    name: "CANONICAL_FLAT",
    isLegacy: false,
  },
  {
    id: 3,
    name: "LEGACY_FLAT",
    isLegacy: true,
  },
];

const itemPriceList = [
  { itemId: 1, sizeId: 10, colorId: 100, salesPrice: 50 },
  { itemId: 1, sizeId: 11, colorId: 101, salesPrice: 60 },
  { itemId: 2, sizeId: null, colorId: null, salesPrice: 75 },
  { itemId: 3, sizeId: null, colorId: null, salesPrice: 90 },
];

const sizeList = [
  { id: 10, name: "S" },
  { id: 11, name: "M" },
  { id: 12, name: "L" },
];

const colorList = [
  { id: 100, name: "Red" },
  { id: 101, name: "Blue" },
  { id: 102, name: "Green" },
];

describe("salesCatalogRules", () => {
  test("derives visible catalog columns from sellable item-master rows", () => {
    expect(getCatalogColumnVisibility(items, itemPriceList)).toEqual({
      showSize: true,
      showColor: true,
    });
  });

  test("filters sellable size and color options from item price rows", () => {
    expect(getCatalogSizeOptions(items, itemPriceList, sizeList, 1)).toEqual([
      { id: 10, name: "S" },
      { id: 11, name: "M" },
    ]);

    expect(getCatalogColorOptions(items, itemPriceList, colorList, 1, 10)).toEqual([
      { id: 100, name: "Red" },
    ]);
  });

  test("resolves price rows without requiring stock presence", () => {
    expect(resolveSellablePriceRow(items, itemPriceList, 1, 11, 101)).toMatchObject({
      itemId: 1,
      sizeId: 11,
      colorId: 101,
      salesPrice: 60,
    });

    expect(resolveSellablePriceRow(items, itemPriceList, 2, "", "")).toMatchObject({
      itemId: 2,
      salesPrice: 75,
    });
  });

  test("resolves legacy price from the item master standard row when flat price rows are absent", () => {
    expect(
      resolveSellablePriceRow(
        [
          {
            id: 3,
            name: "LEGACY_FLAT",
            isLegacy: true,
            ItemPriceList: [{ itemId: 3, sizeId: null, colorId: null, salesPrice: 160, offerPrice: 0 }],
          },
        ],
        [],
        3,
        "",
        ""
      )
    ).toMatchObject({
      itemId: 3,
      salesPrice: 160,
      offerPrice: 0,
    });
  });

  test("validates rows by item-master dimensions rather than global stock-style fields", () => {
    expect(
      areSalesRowsValid(
        [
          { itemId: 1, sizeId: 10, colorId: 100, uomId: 1, qty: 2, price: 50 },
          { itemId: 2, sizeId: "", colorId: "", uomId: 1, qty: 1, price: 75 },
        ],
        items,
        itemPriceList
      )
    ).toBe(true);

    expect(
      areSalesRowsValid(
        [{ itemId: 1, sizeId: "", colorId: "", uomId: 1, qty: 2, price: 50 }],
        items,
        itemPriceList
      )
    ).toBe(false);
  });
});

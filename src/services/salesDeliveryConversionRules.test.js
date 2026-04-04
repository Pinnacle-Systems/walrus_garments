import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFulfillmentAllocations,
  buildStockOutEntries,
  calculateDeliveryNetAmount,
  extractResolvedAllocations,
  getHybridFulfillmentResolutionError,
  getRemainingPaymentCapacity,
  getRemainingQtyBySaleOrderItemId,
  lookupCandidateStockBuckets,
  resolveHybridFulfillmentLines,
  validateConvertedDelivery,
  validateFulfillmentAllocations,
} from "./salesDeliveryConversionRules.js";

test("remaining payment capacity subtracts prior saved deliveries", () => {
  const remainingCapacity = getRemainingPaymentCapacity(1000, [
    {
      id: 1,
      packingChargeEnabled: false,
      shippingChargeEnabled: false,
      SalesDeliveryItems: [{ qty: 2, price: 100, taxPercent: 0, taxMethod: "Inclusive" }],
    },
    {
      id: 2,
      packingChargeEnabled: true,
      packingCharge: 50,
      shippingChargeEnabled: false,
      SalesDeliveryItems: [{ qty: 1, price: 200, taxPercent: 0, taxMethod: "Inclusive" }],
    },
  ]);

  assert.equal(remainingCapacity, 550);
});

test("remaining quantities come from prior saved deliveries by source line", () => {
  const remainingByLine = getRemainingQtyBySaleOrderItemId({
    SaleOrderItems: [
      { id: 11, qty: 10, itemId: 1, sizeId: 1, colorId: 1, uomId: 1, hsnId: 1 },
      { id: 12, qty: 5, itemId: 2, sizeId: null, colorId: null, uomId: 1, hsnId: 1 },
    ],
    SalesDelivery: [
      {
        id: 91,
        SalesDeliveryItems: [
          { saleOrderItemId: 11, qty: 4 },
          { saleOrderItemId: 12, qty: 2 },
        ],
      },
    ],
  });

  assert.equal(remainingByLine.get(11), 6);
  assert.equal(remainingByLine.get(12), 3);
});

test("converted delivery validation uses remaining payment capacity and remaining qty", () => {
  const message = validateConvertedDelivery({
    saleOrderValidationState: {
      saleOrder: {
        SaleOrderItems: [{ id: 11, qty: 10, itemId: 1, sizeId: 1, colorId: 1, uomId: 1, hsnId: 1 }],
      },
      remainingQtyBySaleOrderItemId: new Map([[11, 5]]),
      remainingPaymentCapacity: 300,
    },
    deliveryItems: [{ saleOrderItemId: 11, itemId: 1, sizeId: 1, colorId: 1, uomId: 1, hsnId: 1, qty: 4, price: 100 }],
    packingChargeEnabled: false,
    shippingChargeEnabled: false,
  });

  assert.equal(message, "Payment received is insufficient for this delivery. Required 400.00, remaining capacity 300.00.");
});

test("fulfillment allocation rows and stock-out rows are derived from converted delivery lines", () => {
  const allocations = buildFulfillmentAllocations(
    [{ saleOrderItemId: 11, itemId: 1, sizeId: 1, colorId: 2, uomId: 3, qty: 4, barcode: "ABC" }],
    { saleOrderItems: [{ id: 11, itemId: 1, sizeId: 1, colorId: 2, uomId: 3, hsnId: 1 }], storeId: 7, branchId: 9 }
  );

  assert.deepEqual(allocations[0], {
    salesDeliveryItemId: null,
    saleOrderItemId: 11,
    itemId: 1,
    sizeId: 1,
    colorId: 2,
    uomId: 3,
    storeId: 7,
    branchId: 9,
    barcode: "ABC",
    allocatedQty: 4,
  });

  const stockOutEntries = buildStockOutEntries(allocations, { transactionId: 99 });
  assert.equal(stockOutEntries[0].qty, -4);
  assert.equal(stockOutEntries[0].transactionId, 99);
});

test("delivery net amount includes extra charges", () => {
  const amount = calculateDeliveryNetAmount(
    [{ qty: 2, price: 100, taxPercent: 10, taxMethod: "Exclusive", discountType: "Flat", discountValue: 20 }],
    { packingChargeEnabled: true, packingCharge: 10, shippingChargeEnabled: true, shippingCharge: 5 }
  );

  assert.equal(amount, 213);
});

test("stale fulfillment allocation is rejected when current stock changed", async () => {
  const tx = {
    stock: {
      findMany: async () => [{ qty: 2 }],
    },
  };

  const message = await validateFulfillmentAllocations(tx, [
    { itemId: 1, sizeId: 1, colorId: 2, uomId: 3, storeId: 7, branchId: 9, allocatedQty: 4 },
  ]);

  assert.equal(
    message,
    "Current stock no longer supports the chosen fulfillment allocation. Please reallocate before saving."
  );
});

test("candidate lookup groups stock rows by explicit bucket without pooling ambiguous matches", async () => {
  const tx = {
    stock: {
      findMany: async () => [
        { itemId: 1, sizeId: 1, colorId: 2, uomId: 3, storeId: 7, branchId: 9, barcode: "LOT-A", qty: 2 },
        { itemId: 1, sizeId: 1, colorId: 2, uomId: 3, storeId: 7, branchId: 9, barcode: "LOT-A", qty: 1 },
        { itemId: 1, sizeId: 1, colorId: 2, uomId: 3, storeId: 7, branchId: 9, barcode: "LOT-B", qty: 4 },
      ],
    },
  };

  const buckets = await lookupCandidateStockBuckets(tx, { itemId: 1, sizeId: 1, colorId: 2, uomId: 3 }, {
    storeId: 7,
    branchId: 9,
  });

  assert.deepEqual(buckets, [
    { lineIndex: undefined, itemId: 1, sizeId: 1, colorId: 2, uomId: 3, storeId: 7, branchId: 9, barcode: "LOT-A", availableQty: 3 },
    { lineIndex: undefined, itemId: 1, sizeId: 1, colorId: 2, uomId: 3, storeId: 7, branchId: 9, barcode: "LOT-B", availableQty: 4 },
  ]);
});

test("hybrid fulfillment auto-selects a single candidate bucket when the match is unambiguous", async () => {
  const tx = {
    stock: {
      findMany: async () => [
        { itemId: 1, sizeId: 1, colorId: 2, uomId: 3, storeId: 7, branchId: 9, barcode: "LOT-A", qty: 5 },
      ],
    },
  };

  const resolution = await resolveHybridFulfillmentLines(tx, [
    { itemId: 1, sizeId: 1, colorId: 2, uomId: 3, qty: 4 },
  ], { storeId: 7, branchId: 9 });

  assert.equal(resolution[0].matchType, "single");
  assert.deepEqual(extractResolvedAllocations(resolution), [
    {
      lineIndex: 0,
      salesDeliveryItemId: null,
      saleOrderItemId: null,
      itemId: 1,
      sizeId: 1,
      colorId: 2,
      uomId: 3,
      storeId: 7,
      branchId: 9,
      barcode: "LOT-A",
      allocatedQty: 4,
    },
  ]);
});

test("hybrid fulfillment reports candidate buckets when a line matches multiple stock buckets", async () => {
  const tx = {
    stock: {
      findMany: async () => [
        { itemId: 1, sizeId: 1, colorId: 2, uomId: 3, storeId: 7, branchId: 9, barcode: "LOT-A", qty: 2 },
        { itemId: 1, sizeId: 1, colorId: 2, uomId: 3, storeId: 7, branchId: 9, barcode: "LOT-B", qty: 3 },
      ],
    },
  };

  const resolution = await resolveHybridFulfillmentLines(tx, [
    { itemId: 1, sizeId: 1, colorId: 2, uomId: 3, qty: 2 },
  ], { storeId: 7, branchId: 9 });

  assert.equal(resolution[0].matchType, "multiple");
  assert.equal(extractResolvedAllocations(resolution).length, 0);

  const error = getHybridFulfillmentResolutionError(resolution);
  assert.equal(
    error?.message,
    "One or more lines match multiple stock buckets. Please select the stock bucket before saving."
  );
  assert.equal(error?.fulfillmentResolution?.[0]?.candidateBuckets?.length, 2);
});

test("hybrid fulfillment accepts explicit split allocations under one visible line", async () => {
  const tx = {
    stock: {
      findMany: async () => [],
    },
  };

  const resolution = await resolveHybridFulfillmentLines(tx, [
    {
      itemId: 1,
      qty: 5,
      fulfillmentAllocations: [
        { itemId: 1, barcode: "LOT-A", storeId: 7, branchId: 9, allocatedQty: 2 },
        { itemId: 1, barcode: "LOT-B", storeId: 7, branchId: 9, allocatedQty: 3 },
      ],
    },
  ], { storeId: 7, branchId: 9 });

  assert.equal(resolution[0].matchType, "selected");
  assert.equal(getHybridFulfillmentResolutionError(resolution), null);
  assert.equal(extractResolvedAllocations(resolution).length, 2);
});

test("hybrid fulfillment rejects explicit allocations that do not cover the requested quantity", async () => {
  const tx = {
    stock: {
      findMany: async () => [],
    },
  };

  const resolution = await resolveHybridFulfillmentLines(tx, [
    {
      itemId: 1,
      qty: 5,
      fulfillmentAllocations: [
        { itemId: 1, barcode: "LOT-A", storeId: 7, branchId: 9, allocatedQty: 2 },
      ],
    },
  ], { storeId: 7, branchId: 9 });

  const error = getHybridFulfillmentResolutionError(resolution);
  assert.equal(
    error?.message,
    "Selected stock buckets must exactly cover the requested quantity before save."
  );
});

test("allocation revalidation aggregates split selections against the same bucket", async () => {
  const tx = {
    stock: {
      findMany: async () => [{ qty: 4 }],
    },
  };

  const message = await validateFulfillmentAllocations(tx, [
    { itemId: 1, barcode: "LOT-A", storeId: 7, branchId: 9, allocatedQty: 2 },
    { itemId: 1, barcode: "LOT-A", storeId: 7, branchId: 9, allocatedQty: 3 },
  ]);

  assert.equal(
    message,
    "Current stock no longer supports the chosen fulfillment allocation. Please reallocate before saving."
  );
});

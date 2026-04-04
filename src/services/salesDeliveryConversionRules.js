function parseAmount(value) {
  const parsed = parseFloat(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeId(value) {
  if (value === undefined || value === null || value === "") return "";
  return String(value);
}

function normalizeNullableId(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = parseInt(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeString(value) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

function areAmountsEqual(left, right) {
  return Math.abs(parseAmount(left) - parseAmount(right)) <= 0.0001;
}

function getAllocationBucketKey(allocation = {}) {
  return JSON.stringify({
    itemId: normalizeNullableId(allocation?.itemId),
    sizeId: normalizeNullableId(allocation?.sizeId),
    colorId: normalizeNullableId(allocation?.colorId),
    uomId: normalizeNullableId(allocation?.uomId),
    storeId: normalizeNullableId(allocation?.storeId),
    branchId: normalizeNullableId(allocation?.branchId),
    barcode: normalizeString(allocation?.barcode),
  });
}

function getRequestedAllocationsForLine(line = {}) {
  if (Array.isArray(line?.fulfillmentAllocations)) return line.fulfillmentAllocations;
  if (Array.isArray(line?.allocations)) return line.allocations;
  return [];
}

function normalizeRequestedAllocation(line = {}, allocation = {}, defaults = {}) {
  return {
    lineIndex: defaults.lineIndex,
    salesDeliveryItemId: normalizeNullableId(defaults.salesDeliveryItemId ?? allocation?.salesDeliveryItemId),
    saleOrderItemId: normalizeNullableId(
      defaults.saleOrderItemId ?? allocation?.saleOrderItemId ?? line?.saleOrderItemId
    ),
    itemId: normalizeNullableId(allocation?.itemId ?? line?.itemId),
    sizeId: normalizeNullableId(allocation?.sizeId ?? line?.sizeId),
    colorId: normalizeNullableId(allocation?.colorId ?? line?.colorId),
    uomId: normalizeNullableId(allocation?.uomId ?? line?.uomId),
    storeId: normalizeNullableId(allocation?.storeId ?? line?.storeId ?? defaults.storeId),
    branchId: normalizeNullableId(allocation?.branchId ?? line?.branchId ?? defaults.branchId),
    barcode: normalizeString(allocation?.barcode ?? line?.barcode),
    allocatedQty: parseAmount(allocation?.allocatedQty ?? allocation?.qty),
  };
}

function createAutoAllocationFromCandidate(candidate = {}, requestedQty = 0, defaults = {}) {
  return {
    lineIndex: defaults.lineIndex,
    salesDeliveryItemId: normalizeNullableId(defaults.salesDeliveryItemId),
    saleOrderItemId: normalizeNullableId(defaults.saleOrderItemId),
    itemId: normalizeNullableId(candidate?.itemId),
    sizeId: normalizeNullableId(candidate?.sizeId),
    colorId: normalizeNullableId(candidate?.colorId),
    uomId: normalizeNullableId(candidate?.uomId),
    storeId: normalizeNullableId(candidate?.storeId),
    branchId: normalizeNullableId(candidate?.branchId),
    barcode: normalizeString(candidate?.barcode),
    allocatedQty: parseAmount(requestedQty),
  };
}

function createGroupedCandidateBucket(line = {}, bucket = {}, defaults = {}) {
  return {
    lineIndex: defaults.lineIndex,
    itemId: normalizeNullableId(bucket?.itemId ?? line?.itemId),
    sizeId: normalizeNullableId(bucket?.sizeId),
    colorId: normalizeNullableId(bucket?.colorId),
    uomId: normalizeNullableId(bucket?.uomId),
    storeId: normalizeNullableId(bucket?.storeId ?? defaults.storeId),
    branchId: normalizeNullableId(bucket?.branchId ?? defaults.branchId),
    barcode: normalizeString(bucket?.barcode),
    availableQty: parseAmount(bucket?.availableQty),
  };
}

function createResolutionError(message, resolution = []) {
  const error = new Error(message);
  error.fulfillmentResolution = resolution;
  return error;
}

export function calculateDeliveryNetAmount(
  deliveryItems = [],
  { packingChargeEnabled, packingCharge, shippingChargeEnabled, shippingCharge } = {}
) {
  const lineNetAmount = (deliveryItems || []).reduce((acc, curr) => {
    const price = parseAmount(curr?.price);
    const qty = parseAmount(curr?.qty);
    const taxPercent = parseAmount(curr?.taxPercent);
    const taxMethod = curr?.taxMethod || "Inclusive";
    const discountType = curr?.discountType;
    const discountValue = parseAmount(curr?.discountValue);

    const gross = price * qty;
    let discountedAmount = gross;

    if (discountType === "Percentage") {
      discountedAmount = gross - (gross * discountValue) / 100;
    } else if (discountType === "Flat") {
      discountedAmount = gross - discountValue;
    }

    discountedAmount = Math.max(0, discountedAmount);

    if (taxMethod === "Inclusive" && taxPercent > 0) {
      return acc + discountedAmount;
    }

    return acc + discountedAmount + (discountedAmount * taxPercent) / 100;
  }, 0);

  const packingAmount = packingChargeEnabled ? parseAmount(packingCharge) : 0;
  const shippingAmount = shippingChargeEnabled ? parseAmount(shippingCharge) : 0;

  return lineNetAmount + packingAmount + shippingAmount;
}

function isSameSourceLine(saleOrderItem, deliveryItem) {
  return normalizeId(saleOrderItem?.itemId) === normalizeId(deliveryItem?.itemId)
    && normalizeId(saleOrderItem?.sizeId) === normalizeId(deliveryItem?.sizeId)
    && normalizeId(saleOrderItem?.colorId) === normalizeId(deliveryItem?.colorId)
    && normalizeId(saleOrderItem?.uomId) === normalizeId(deliveryItem?.uomId)
    && normalizeId(saleOrderItem?.hsnId) === normalizeId(deliveryItem?.hsnId);
}

export function resolveSaleOrderItemId(deliveryItem, saleOrderItems = []) {
  if (deliveryItem?.saleOrderItemId) {
    return parseInt(deliveryItem.saleOrderItemId);
  }

  const matchedItem = (saleOrderItems || []).find((saleOrderItem) =>
    isSameSourceLine(saleOrderItem, deliveryItem)
  );

  return matchedItem?.id ? parseInt(matchedItem.id) : null;
}

export function getRemainingQtyBySaleOrderItemId(saleOrder, excludeSalesDeliveryId = null) {
  const saleOrderItems = saleOrder?.SaleOrderItems || [];
  const deliveredQtyBySaleOrderItemId = new Map();

  for (const salesDelivery of saleOrder?.SalesDelivery || []) {
    if (excludeSalesDeliveryId && parseInt(salesDelivery?.id) === parseInt(excludeSalesDeliveryId)) {
      continue;
    }

    for (const deliveryItem of salesDelivery?.SalesDeliveryItems || []) {
      const saleOrderItemId = resolveSaleOrderItemId(deliveryItem, saleOrderItems);
      if (!saleOrderItemId) continue;

      deliveredQtyBySaleOrderItemId.set(
        saleOrderItemId,
        (deliveredQtyBySaleOrderItemId.get(saleOrderItemId) || 0) + parseAmount(deliveryItem?.qty)
      );
    }
  }

  const remainingQtyBySaleOrderItemId = new Map();

  for (const saleOrderItem of saleOrderItems) {
    const orderedQty = parseAmount(saleOrderItem?.qty);
    const deliveredQty = deliveredQtyBySaleOrderItemId.get(parseInt(saleOrderItem.id)) || 0;
    remainingQtyBySaleOrderItemId.set(parseInt(saleOrderItem.id), Math.max(0, orderedQty - deliveredQty));
  }

  return remainingQtyBySaleOrderItemId;
}

export function getConsumedDeliveryAmount(salesDeliveries = [], excludeSalesDeliveryId = null) {
  return (salesDeliveries || []).reduce((acc, salesDelivery) => {
    if (excludeSalesDeliveryId && parseInt(salesDelivery?.id) === parseInt(excludeSalesDeliveryId)) {
      return acc;
    }

    return acc + calculateDeliveryNetAmount(salesDelivery?.SalesDeliveryItems, salesDelivery);
  }, 0);
}

export function getRemainingPaymentCapacity(totalReceivedAmount, salesDeliveries = [], excludeSalesDeliveryId = null) {
  return Math.max(
    0,
    parseAmount(totalReceivedAmount) - getConsumedDeliveryAmount(salesDeliveries, excludeSalesDeliveryId)
  );
}

export function buildFulfillmentAllocations(deliveryItems = [], { saleOrderItems = [], storeId, branchId } = {}) {
  return (deliveryItems || [])
    .filter((deliveryItem) => deliveryItem?.itemId && parseAmount(deliveryItem?.qty) > 0)
    .map((deliveryItem) => ({
      salesDeliveryItemId: deliveryItem?.id ? parseInt(deliveryItem.id) : null,
      saleOrderItemId: resolveSaleOrderItemId(deliveryItem, saleOrderItems),
      itemId: deliveryItem?.itemId ? parseInt(deliveryItem.itemId) : null,
      sizeId: deliveryItem?.sizeId ? parseInt(deliveryItem.sizeId) : null,
      colorId: deliveryItem?.colorId ? parseInt(deliveryItem.colorId) : null,
      uomId: deliveryItem?.uomId ? parseInt(deliveryItem.uomId) : null,
      storeId: storeId ? parseInt(storeId) : null,
      branchId: branchId ? parseInt(branchId) : null,
      barcode: deliveryItem?.barcode ? String(deliveryItem.barcode) : null,
      allocatedQty: parseAmount(deliveryItem?.qty),
    }));
}

export async function lookupCandidateStockBuckets(tx, fulfillmentLine = {}, { storeId, branchId } = {}) {
  if (!fulfillmentLine?.itemId) return [];

  const matchingStockRows = await tx.stock.findMany({
    where: {
      branchId: normalizeNullableId(fulfillmentLine?.branchId ?? branchId) ?? undefined,
      storeId: normalizeNullableId(fulfillmentLine?.storeId ?? storeId) ?? undefined,
      itemId: normalizeNullableId(fulfillmentLine?.itemId) ?? undefined,
      sizeId: fulfillmentLine?.sizeId === undefined || fulfillmentLine?.sizeId === ""
        ? undefined
        : normalizeNullableId(fulfillmentLine?.sizeId),
      colorId: fulfillmentLine?.colorId === undefined || fulfillmentLine?.colorId === ""
        ? undefined
        : normalizeNullableId(fulfillmentLine?.colorId),
      uomId: fulfillmentLine?.uomId === undefined || fulfillmentLine?.uomId === ""
        ? undefined
        : normalizeNullableId(fulfillmentLine?.uomId),
      barcode: fulfillmentLine?.barcode ? String(fulfillmentLine.barcode) : undefined,
    },
    select: {
      itemId: true,
      sizeId: true,
      colorId: true,
      uomId: true,
      storeId: true,
      branchId: true,
      barcode: true,
      qty: true,
    },
  });

  const bucketMap = new Map();

  for (const stockRow of matchingStockRows || []) {
    const bucket = createGroupedCandidateBucket(fulfillmentLine, {
      ...stockRow,
      availableQty: stockRow?.qty,
    }, {
      storeId,
      branchId,
      lineIndex: fulfillmentLine?.lineIndex,
    });
    const bucketKey = getAllocationBucketKey(bucket);
    const nextQty = (bucketMap.get(bucketKey)?.availableQty || 0) + parseAmount(stockRow?.qty);
    bucketMap.set(bucketKey, {
      ...bucket,
      availableQty: nextQty,
    });
  }

  return Array.from(bucketMap.values()).filter((bucket) => bucket.availableQty > 0.0001);
}

export async function resolveHybridFulfillmentLines(
  tx,
  fulfillmentLines = [],
  { saleOrderItems = [], storeId, branchId } = {}
) {
  const resolutions = [];

  for (const [lineIndex, line] of (fulfillmentLines || []).entries()) {
    if (!line?.itemId || parseAmount(line?.qty) <= 0) continue;

    const saleOrderItemId = resolveSaleOrderItemId(line, saleOrderItems);
    const defaults = {
      lineIndex,
      salesDeliveryItemId: line?.id,
      saleOrderItemId,
      storeId,
      branchId,
    };
    const requestedQty = parseAmount(line?.qty);
    const requestedAllocations = getRequestedAllocationsForLine(line)
      .map((allocation) => normalizeRequestedAllocation(line, allocation, defaults))
      .filter((allocation) => allocation.itemId && allocation.allocatedQty > 0);

    if (requestedAllocations.length > 0) {
      const selectedQty = requestedAllocations.reduce((acc, allocation) => acc + parseAmount(allocation?.allocatedQty), 0);
      resolutions.push({
        lineIndex,
        matchType: "selected",
        requestedQty,
        saleOrderItemId,
        candidateBuckets: [],
        allocations: requestedAllocations,
        selectionError: areAmountsEqual(selectedQty, requestedQty)
          ? null
          : "Selected stock buckets must exactly cover the requested quantity before save.",
      });
      continue;
    }

    const candidateBuckets = await lookupCandidateStockBuckets(tx, line, { storeId, branchId });

    if (candidateBuckets.length === 0) {
      resolutions.push({
        lineIndex,
        matchType: "none",
        requestedQty,
        saleOrderItemId,
        candidateBuckets: [],
        allocations: [],
        selectionError: null,
      });
      continue;
    }

    if (candidateBuckets.length === 1) {
      resolutions.push({
        lineIndex,
        matchType: "single",
        requestedQty,
        saleOrderItemId,
        candidateBuckets,
        allocations: [
          createAutoAllocationFromCandidate(candidateBuckets[0], requestedQty, defaults),
        ],
        selectionError: null,
      });
      continue;
    }

    resolutions.push({
      lineIndex,
      matchType: "multiple",
      requestedQty,
      saleOrderItemId,
      candidateBuckets,
      allocations: [],
      selectionError: null,
    });
  }

  return resolutions;
}

export function extractResolvedAllocations(resolutions = []) {
  return (resolutions || []).flatMap((resolution) => resolution?.allocations || []);
}

export function getHybridFulfillmentResolutionError(resolutions = []) {
  const invalidSelection = (resolutions || []).find((resolution) => resolution?.selectionError);
  if (invalidSelection) {
    return createResolutionError(invalidSelection.selectionError, resolutions);
  }

  const missingMatch = (resolutions || []).find((resolution) => resolution?.matchType === "none");
  if (missingMatch) {
    return createResolutionError(
      "No fulfillable stock match exists for one or more lines. Refresh the stock choices and try again.",
      resolutions
    );
  }

  const ambiguousMatch = (resolutions || []).find((resolution) => resolution?.matchType === "multiple");
  if (ambiguousMatch) {
    return createResolutionError(
      "One or more lines match multiple stock buckets. Please select the stock bucket before saving.",
      resolutions
    );
  }

  return null;
}

export function buildStockOutEntries(allocations = [], { transactionId, inOrOut = "SalesDelivery" } = {}) {
  return (allocations || []).map((allocation) => ({
    itemId: allocation.itemId ? parseInt(allocation.itemId) : null,
    sizeId: allocation.sizeId ? parseInt(allocation.sizeId) : null,
    colorId: allocation.colorId ? parseInt(allocation.colorId) : null,
    uomId: allocation.uomId ? parseInt(allocation.uomId) : null,
    qty: 0 - parseAmount(allocation.allocatedQty),
    storeId: allocation.storeId ? parseInt(allocation.storeId) : null,
    branchId: allocation.branchId ? parseInt(allocation.branchId) : null,
    barcode: allocation.barcode || null,
    inOrOut,
    transactionId: transactionId ? parseInt(transactionId) : null,
  }));
}

export async function validateFulfillmentAllocations(tx, allocations = []) {
  const aggregatedAllocations = new Map();

  for (const allocation of allocations) {
    const bucketKey = getAllocationBucketKey(allocation);
    const nextAllocatedQty = (aggregatedAllocations.get(bucketKey)?.allocatedQty || 0) + parseAmount(allocation?.allocatedQty);
    aggregatedAllocations.set(bucketKey, {
      ...allocation,
      allocatedQty: nextAllocatedQty,
    });
  }

  for (const allocation of aggregatedAllocations.values()) {
    if (!allocation?.itemId) {
      return "Each converted delivery line must be tied to a valid stock allocation.";
    }

    const matchingStockRows = await tx.stock.findMany({
      where: {
        branchId: allocation.branchId ? parseInt(allocation.branchId) : undefined,
        storeId: allocation.storeId ? parseInt(allocation.storeId) : undefined,
        itemId: allocation.itemId ? parseInt(allocation.itemId) : undefined,
        sizeId: allocation.sizeId ? parseInt(allocation.sizeId) : null,
        colorId: allocation.colorId ? parseInt(allocation.colorId) : null,
        uomId: allocation.uomId ? parseInt(allocation.uomId) : null,
      },
      select: {
        qty: true,
      },
    });

    const availableQty = (matchingStockRows || []).reduce((acc, row) => acc + parseAmount(row?.qty), 0);

    if (availableQty + 0.0001 < parseAmount(allocation.allocatedQty)) {
      return "Current stock no longer supports the chosen fulfillment allocation. Please reallocate before saving.";
    }
  }

  return null;
}

export function validateConvertedDelivery({
  saleOrderValidationState,
  deliveryItems,
  packingChargeEnabled,
  packingCharge,
  shippingChargeEnabled,
  shippingCharge,
}) {
  if (!saleOrderValidationState) return null;

  const deliveryNetAmount = calculateDeliveryNetAmount(deliveryItems, {
    packingChargeEnabled,
    packingCharge,
    shippingChargeEnabled,
    shippingCharge,
  });

  if (saleOrderValidationState.remainingPaymentCapacity < deliveryNetAmount) {
    return `Payment received is insufficient for this delivery. Required ${deliveryNetAmount.toFixed(2)}, remaining capacity ${saleOrderValidationState.remainingPaymentCapacity.toFixed(2)}.`;
  }

  for (const deliveryItem of (deliveryItems || []).filter((item) => item?.itemId)) {
    const saleOrderItemId = resolveSaleOrderItemId(deliveryItem, saleOrderValidationState.saleOrder?.SaleOrderItems);
    if (!saleOrderItemId) {
      return "Each converted delivery line must be tied to a sale order line.";
    }

    const remainingQty = saleOrderValidationState.remainingQtyBySaleOrderItemId.get(parseInt(saleOrderItemId)) || 0;
    const requestedQty = parseAmount(deliveryItem?.qty);

    if (requestedQty > remainingQty + 0.0001) {
      return "One or more delivery quantities exceed the remaining sale order quantity.";
    }
  }

  return null;
}

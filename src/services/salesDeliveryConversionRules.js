function parseAmount(value) {
  const parsed = parseFloat(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeId(value) {
  if (value === undefined || value === null || value === "") return "";
  return String(value);
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
  for (const allocation of allocations) {
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

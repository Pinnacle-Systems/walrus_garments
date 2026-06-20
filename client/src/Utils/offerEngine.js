/**
 * Offer Engine Utility
 * 
 * Shared logic for calculating applicable offers and final prices
 * for POS, Quotation, and Sale Order modules.
 */

const getOfferScopeQty = (item, cart, selectedOffer) => {
    const inScopeItems = cart.filter(cit => {
        if (cit.barcodeType === 'CLEARANCE' && !selectedOffer.applyToClearance) return false;
        if (selectedOffer.scopeMode === 'Global') return true;
        const targetId = cit.itemId || cit.id;
        if (selectedOffer.scopeMode === 'Item' || selectedOffer.scopeMode === 'Collection') {
            return selectedOffer.OfferScope?.some(s => String(s.refId) === String(targetId));
        }
        return false;
    });

    const rules = selectedOffer.OfferRule?.[0]?.conditions?.rules || [];
    let filteredItems = [...inScopeItems];

    rules.forEach(rule => {
        if (rule.field === 'Sizes') {
            const sizeValues = Array.isArray(rule.value) ? rule.value : (typeof rule.value === 'string' ? rule.value.split(',') : []);
            const sizeIds = sizeValues.map(v => typeof v === 'object' ? String(v.value) : String(v));
            filteredItems = filteredItems.filter(cit => sizeIds.includes(String(cit.sizeId)));
        } else if (rule.field === 'Colors') {
            const colorValues = Array.isArray(rule.value) ? rule.value : (typeof rule.value === 'string' ? rule.value.split(',') : []);
            const colorIds = colorValues.map(v => typeof v === 'object' ? String(v.value) : String(v));
            filteredItems = filteredItems.filter(cit => colorIds.includes(String(cit.colorId)));
        }
    });

    let groupByKeys = [];
    rules.forEach(rule => {
        if (rule.groupBy && rule.groupBy.length > 0) {
            groupByKeys = rule.groupBy;
        }
    });

    if (groupByKeys.length > 0) {
        const hasAllGroupFields = groupByKeys.every(gField => {
            if (gField === 'sizeId') return !!item.sizeId;
            if (gField === 'colorId') return !!item.colorId;
            if (gField === 'sameItem') return !!item.itemId || !!item.id;
            return !!item[gField];
        });
        if (!hasAllGroupFields) return 0;

        return filteredItems.filter(cit => {
            const hasFields = groupByKeys.every(gField => {
                if (gField === 'sizeId') return !!cit.sizeId;
                if (gField === 'colorId') return !!cit.colorId;
                if (gField === 'sameItem') return !!cit.itemId || !!cit.id;
                return !!cit[gField];
            });
            if (!hasFields) return false;

            return groupByKeys.every(gField => {
                if (gField === 'sizeId') return String(cit.sizeId) === String(item.sizeId);
                if (gField === 'colorId') return String(cit.colorId) === String(item.colorId);
                if (gField === 'sameItem') return String(cit.itemId || cit.id) === String(item.itemId || item.id);
                return String(cit[gField]) === String(item[gField]);
            });
        }).reduce((sum, cit) => sum + (parseFloat(cit.qty) || 0), 0);
    }

    return filteredItems.reduce((sum, cit) => sum + (parseFloat(cit.qty) || 0), 0);
};

const isOfferDateValid = (offer) => {
    if (!offer) return false;
    if (offer.active === false) return false;

    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const validFrom = offer.validFrom || offer.startTime;
    const validTo = offer.validTo || offer.endTime;
    const noEndDate = offer.noEndDate;

    if (validFrom && todayStr < validFrom) {
        return false;
    }
    if (!noEndDate && validTo && todayStr > validTo) {
        return false;
    }
    return true;
};

/**
 * Identifies which offers are potentially applicable to the current cart/document
 * based on rules (Min Qty, Cart Value, Scope).
 */
export const getPotentialOffers = (activeOffers, cart) => {
    if (!activeOffers?.length || !cart?.length) return [];

    const potential = [];
    activeOffers.forEach(off => {
        if (!isOfferDateValid(off)) return;
        const inScopeItems = cart.filter(item => {
            if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
            if (off.scopeMode === 'Global') return true;
            const targetId = item.itemId || item.id;
            if (off.scopeMode === 'Item' || off.scopeMode === 'Collection') {
                return off.OfferScope?.some(s => String(s.refId) === String(targetId));
            }
            return false;
        });
        if (!inScopeItems.length) return;

        const rules = off.OfferRule?.[0]?.conditions?.rules || [];
        let filteredScopeItems = [...inScopeItems];
        rules.forEach(rule => {
            if (rule.field === 'Sizes') {
                const sizeValues = Array.isArray(rule.value) ? rule.value : (typeof rule.value === 'string' ? rule.value.split(',') : []);
                const sizeIds = sizeValues.map(v => typeof v === 'object' ? String(v.value) : String(v));
                filteredScopeItems = filteredScopeItems.filter(cit => sizeIds.includes(String(cit.sizeId)));
            } else if (rule.field === 'Colors') {
                const colorValues = Array.isArray(rule.value) ? rule.value : (typeof rule.value === 'string' ? rule.value.split(',') : []);
                const colorIds = colorValues.map(v => typeof v === 'object' ? String(v.value) : String(v));
                filteredScopeItems = filteredScopeItems.filter(cit => colorIds.includes(String(cit.colorId)));
            }
        });

        const scopeQty = filteredScopeItems.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
        const scopeValue = filteredScopeItems.reduce((sum, i) => sum + ((parseFloat(i.salesPrice || i.price) || 0) * (parseFloat(i.qty) || 0)), 0);

        const results = rules.map(rule => {
            if (rule.field === 'Sizes' || rule.field === 'Colors') return true;

            if (rule.field === 'Variant Matrix') {
                const matrixRules = rule.matrix || [];
                const res = matrixRules.map(mRow => {
                    const matchQty = filteredScopeItems
                        .filter(item => {
                            if (mRow.sizeId && String(item.sizeId) !== String(mRow.sizeId)) return false;
                            if (mRow.colorId && String(item.colorId) !== String(mRow.colorId)) return false;
                            return true;
                        })
                        .reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
                    return matchQty >= parseFloat(mRow.qty);
                });
                return rule.logic === 'OR' ? res.some(r => r) : res.every(r => r);
            }

            if (rule.field === 'Unique Sizes') {
                const distinctSizes = new Set(filteredScopeItems.map(item => String(item.sizeId)));
                if (rule.operator === '>=') return distinctSizes.size >= parseFloat(rule.value);
                if (rule.operator === '<=') return distinctSizes.size <= parseFloat(rule.value);
                if (rule.operator === '==') return distinctSizes.size === parseFloat(rule.value);
                return false;
            }

            if (rule.field === 'Unique Colors') {
                const distinctColors = new Set(filteredScopeItems.map(item => String(item.colorId)));
                if (rule.operator === '>=') return distinctColors.size >= parseFloat(rule.value);
                if (rule.operator === '<=') return distinctColors.size <= parseFloat(rule.value);
                if (rule.operator === '==') return distinctColors.size === parseFloat(rule.value);
                return false;
            }

            if (rule.groupBy && rule.groupBy.length > 0) {
                const groups = {};
                const validScopeItems = filteredScopeItems.filter(cit => {
                    return rule.groupBy.every(gField => {
                        if (gField === 'sizeId') return !!cit.sizeId;
                        if (gField === 'colorId') return !!cit.colorId;
                        return !!cit[gField];
                    });
                });

                validScopeItems.forEach(item => {
                    const key = rule.groupBy.map(gField => {
                        if (gField === 'sizeId') return item.sizeId;
                        if (gField === 'colorId') return item.colorId;
                        return item[gField];
                    }).join('-');
                    const qty = parseFloat(item.qty) || 0;
                    const val = ((parseFloat(item.salesPrice || item.price) || 0) * qty);
                    if (!groups[key]) groups[key] = { qty: 0, val: 0 };
                    groups[key].qty += qty;
                    groups[key].val += val;
                });
                const groupResults = Object.values(groups).map(g => {
                    const target = rule.field === 'Minimum Quantity' ? g.qty : (rule.field === 'Cart Value' ? g.val : 0);
                    if (rule.operator === '>=') return target >= parseFloat(rule.value);
                    if (rule.operator === '<=') return target <= parseFloat(rule.value);
                    if (rule.operator === '==') return target === parseFloat(rule.value);
                    if (rule.operator === '<') return target < parseFloat(rule.value);
                    if (rule.operator === '>') return target > parseFloat(rule.value);
                    return false;
                });
                return groupResults.some(r => r);
            }

            const target = rule.field === 'Minimum Quantity' ? scopeQty : (rule.field === 'Cart Value' ? scopeValue : 0);
            if (rule.operator === '>=') return target >= parseFloat(rule.value);
            if (rule.operator === '<=') return target <= parseFloat(rule.value);
            if (rule.operator === '==') return target === parseFloat(rule.value);
            if (rule.operator === '<') return target < parseFloat(rule.value);
            if (rule.operator === '>') return target > parseFloat(rule.value);
            return true;
        });

        const isValid = off.OfferRule?.[0]?.logic === 'OR' ? results.some(r => r) : results.every(r => r);
        if (!isValid && rules.length > 0) return;

        let discountValue = 0;
        if (off.discountType === 'Percentage') {
            discountValue = (scopeValue * (off.discountValue || 0)) / 100;
            if (off.maxDiscountValue && discountValue > off.maxDiscountValue) discountValue = off.maxDiscountValue;
        } else if (off.discountType === 'Fixed') {
            discountValue = off.discountValue || 0;
        } else if (['Volume', 'Override'].includes(off.discountType)) {
            const sortedTiers = [...(off.OfferTier || [])].sort((a, b) => b.minQty - a.minQty);
            const tier = sortedTiers.find(t => scopeQty >= t.minQty);

            if (tier) {
                if (tier.type === 'Percentage') discountValue = (scopeValue * tier.value) / 100;
                else if (off.discountType === 'Override') discountValue = Math.max(0, scopeValue - (tier.value * scopeQty));
                else discountValue = tier.value;
            }
        }
        if (discountValue > 0) potential.push({ ...off, calculatedDiscount: discountValue, inScopeItems });
    });
    return potential;
};

// Evaluates potential offers specifically for exchange carts, factoring in 'keptQty' 
// (items the customer previously bought and is keeping) rather than just active cart quantities.
export const getPotentialExchangeOffers = (activeOffers, cart) => {
    if (!activeOffers?.length || !cart?.length) return [];

    const potential = [];
    activeOffers.forEach(off => {
        if (!isOfferDateValid(off)) return;
        const inScopeItems = cart.filter(item => {
            if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
            if (off.scopeMode === 'Global') return true;
            const targetId = item.itemId || item.id;
            if (off.scopeMode === 'Item' || off.scopeMode === 'Collection') {
                return off.OfferScope?.some(s => String(s.refId) === String(targetId));
            }
            return false;
        });
        if (!inScopeItems.length) return;

        const rules = off.OfferRule?.[0]?.conditions?.rules || [];
        let filteredScopeItems = [...inScopeItems];
        rules.forEach(rule => {
            if (rule.field === 'Sizes') {
                const sizeValues = Array.isArray(rule.value) ? rule.value : (typeof rule.value === 'string' ? rule.value.split(',') : []);
                const sizeIds = sizeValues.map(v => typeof v === 'object' ? String(v.value) : String(v));
                filteredScopeItems = filteredScopeItems.filter(cit => sizeIds.includes(String(cit.sizeId)));
            } else if (rule.field === 'Colors') {
                const colorValues = Array.isArray(rule.value) ? rule.value : (typeof rule.value === 'string' ? rule.value.split(',') : []);
                const colorIds = colorValues.map(v => typeof v === 'object' ? String(v.value) : String(v));
                filteredScopeItems = filteredScopeItems.filter(cit => colorIds.includes(String(cit.colorId)));
            }
        });

        // Exchange-aware qty & value helpers
        const getEffectiveQty = (item) => {
            return item.isReturn ? Math.max(0, parseFloat(item.originalQty || 0) - parseFloat(item.qty || 0)) : (parseFloat(item.qty) || 0);
        };
        const getEffectiveValue = (item) => {
            return (parseFloat(item.salesPrice || item.price) || 0) * getEffectiveQty(item);
        };

        const scopeQty = filteredScopeItems.reduce((sum, i) => sum + getEffectiveQty(i), 0);
        const scopeValue = filteredScopeItems.reduce((sum, i) => sum + getEffectiveValue(i), 0);

        const results = rules.map(rule => {
            if (rule.field === 'Sizes' || rule.field === 'Colors') return true;

            if (rule.field === 'Variant Matrix') {
                const matrixRules = rule.matrix || [];
                const res = matrixRules.map(mRow => {
                    const matchQty = filteredScopeItems
                        .filter(item => {
                            if (mRow.sizeId && String(item.sizeId) !== String(mRow.sizeId)) return false;
                            if (mRow.colorId && String(item.colorId) !== String(mRow.colorId)) return false;
                            return true;
                        })
                        .reduce((sum, i) => sum + getEffectiveQty(i), 0);
                    return matchQty >= parseFloat(mRow.qty);
                });
                return rule.logic === 'OR' ? res.some(r => r) : res.every(r => r);
            }

            if (rule.field === 'Unique Sizes') {
                const distinctSizes = new Set(filteredScopeItems.filter(i => getEffectiveQty(i) > 0).map(item => String(item.sizeId)));
                if (rule.operator === '>=') return distinctSizes.size >= parseFloat(rule.value);
                if (rule.operator === '<=') return distinctSizes.size <= parseFloat(rule.value);
                if (rule.operator === '==') return distinctSizes.size === parseFloat(rule.value);
                return false;
            }

            if (rule.field === 'Unique Colors') {
                const distinctColors = new Set(filteredScopeItems.filter(i => getEffectiveQty(i) > 0).map(item => String(item.colorId)));
                if (rule.operator === '>=') return distinctColors.size >= parseFloat(rule.value);
                if (rule.operator === '<=') return distinctColors.size <= parseFloat(rule.value);
                if (rule.operator === '==') return distinctColors.size === parseFloat(rule.value);
                return false;
            }

            if (rule.groupBy && rule.groupBy.length > 0) {
                const groups = {};
                const validScopeItems = filteredScopeItems.filter(cit => {
                    return rule.groupBy.every(gField => {
                        if (gField === 'sizeId') return !!cit.sizeId;
                        if (gField === 'colorId') return !!cit.colorId;
                        return !!cit[gField];
                    });
                });

                validScopeItems.forEach(item => {
                    const key = rule.groupBy.map(gField => {
                        if (gField === 'sizeId') return item.sizeId;
                        if (gField === 'colorId') return item.colorId;
                        return item[gField];
                    }).join('-');
                    const qty = getEffectiveQty(item);
                    const val = getEffectiveValue(item);
                    if (!groups[key]) groups[key] = { qty: 0, val: 0 };
                    groups[key].qty += qty;
                    groups[key].val += val;
                });
                const groupResults = Object.values(groups).map(g => {
                    const target = rule.field === 'Minimum Quantity' ? g.qty : (rule.field === 'Cart Value' ? g.val : 0);
                    if (rule.operator === '>=') return target >= parseFloat(rule.value);
                    if (rule.operator === '<=') return target <= parseFloat(rule.value);
                    if (rule.operator === '==') return target === parseFloat(rule.value);
                    if (rule.operator === '<') return target < parseFloat(rule.value);
                    if (rule.operator === '>') return target > parseFloat(rule.value);
                    return false;
                });
                return groupResults.some(r => r);
            }

            const target = rule.field === 'Minimum Quantity' ? scopeQty : (rule.field === 'Cart Value' ? scopeValue : 0);
            if (rule.operator === '>=') return target >= parseFloat(rule.value);
            if (rule.operator === '<=') return target <= parseFloat(rule.value);
            if (rule.operator === '==') return target === parseFloat(rule.value);
            if (rule.operator === '<') return target < parseFloat(rule.value);
            if (rule.operator === '>') return target > parseFloat(rule.value);
            return true;
        });

        const isValid = off.OfferRule?.[0]?.logic === 'OR' ? results.some(r => r) : results.every(r => r);
        if (!isValid && rules.length > 0) return;

        let discountValue = 0;
        if (off.discountType === 'Percentage') {
            discountValue = (scopeValue * (off.discountValue || 0)) / 100;
            if (off.maxDiscountValue && discountValue > off.maxDiscountValue) discountValue = off.maxDiscountValue;
        } else if (off.discountType === 'Fixed') {
            discountValue = off.discountValue || 0;
        } else if (['Volume', 'Override'].includes(off.discountType)) {
            const sortedTiers = [...(off.OfferTier || [])].sort((a, b) => b.minQty - a.minQty);
            const tier = sortedTiers.find(t => scopeQty >= t.minQty);

            if (tier) {
                if (tier.type === 'Percentage') discountValue = (scopeValue * tier.value) / 100;
                else if (off.discountType === 'Override') discountValue = Math.max(0, scopeValue - (tier.value * scopeQty));
                else discountValue = tier.value;
            }
        }
        if (discountValue > 0) potential.push({ ...off, calculatedDiscount: discountValue, inScopeItems });
    });
    return potential;
};






export const calculateExchangeCartWithOffers = (cart, activeOffers, selectedOffersByRow) => {
    if (!cart?.length) return cart;

    const returnItems = cart.filter(item => item.isReturn);
    const newItems = cart.filter(item => !item.isReturn);

    const reappliedTracker = {};

    const computed = cart.map(item => {
        const cartKey = `${item.itemId || item.id}-${item.sizeId || 0}-${item.colorId || 0}-${item.barcodeType || ''}`;

        let rowOfferId = selectedOffersByRow[cartKey] || item.originalOfferId;

        console.log({
            selectedOffersByRow,
            cartKey,
            rowOfferId
        })

        if (!item.isReturn && !rowOfferId) {
            if (!item.isExchangeItem) {
                const directMatch = activeOffers.find(off => {
                    if (!isOfferDateValid(off)) return false;
                    if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
                    if (off.scopeMode === 'Global') return true;
                    const targetId = item.itemId || item.id;
                    return off.OfferScope?.some(s => String(s.refId) === String(targetId));
                });
                if (directMatch) rowOfferId = directMatch.id;
            } else {
                const exactMatchReturn = returnItems.find(r =>
                    (r.itemId || r.id) === (item.itemId || item.id) &&
                    String(r.sizeId || '') === String(item.sizeId || '') &&
                    String(r.colorId || '') === String(item.colorId || '') &&
                    (r.originalOfferId || r.appliedOfferSnapshot)
                );

                if (exactMatchReturn) {
                    rowOfferId = exactMatchReturn.originalOfferId || exactMatchReturn.appliedOfferSnapshot?.id;
                } else {
                    // 2. Same item match - only inherit if the offer doesn't restrict by specific variants/groups
                    const sameItemReturn = returnItems.find(r =>
                        (r.itemId || r.id) === (item.itemId || item.id) && (r.originalOfferId || r.appliedOfferSnapshot)
                    );

                    if (sameItemReturn) {
                        const snap = sameItemReturn.appliedOfferSnapshot || activeOffers.find(o => String(o.id) === String(sameItemReturn.originalOfferId || sameItemReturn.appliedOfferSnapshot?.id));
                        if (snap) {
                            const rules = snap.OfferRule?.[0]?.conditions?.rules || [];
                            const isStrict = rules.some(rule =>
                                ['Sizes', 'Colors', 'Variant Matrix', 'Unique Sizes', 'Unique Colors'].includes(rule.field) ||
                                (rule.groupBy && rule.groupBy.length > 0)
                            );
                            // If no strict rules, it's safe to inherit for a different variant
                            if (!isStrict) {
                                rowOfferId = sameItemReturn.originalOfferId || snap.id;
                            }
                        }
                    }

                    // 3. NEW: If still no offer, check if any activeOffer directly applies to this new item
                    if (!rowOfferId) {
                        const directMatch = activeOffers.find(off => {
                            if (!isOfferDateValid(off)) return false;
                            if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
                            if (off.scopeMode === 'Global') return true;
                            const targetId = item.itemId || item.id;
                            return off.OfferScope?.some(s => String(s.refId) === String(targetId));
                        });
                        if (directMatch) rowOfferId = directMatch.id;
                    }
                }
            }
        }

        // Base values
        const salesPrice = parseFloat(item.originalSalesPrice || item.price || item.salesPrice || 0);
        // const salesPrice = parseFloat(item.price || 0);
        let currentItemPrice = salesPrice;
        let appliedOfferName = null;
        let offerReversal = 0;
        let offerReapplied = 0;

        if (!rowOfferId) {
            return {
                ...item,
                priceType: 'SalesPrice',
                price: currentItemPrice,
                appliedOfferName: null,
                offerReversal,
                offerReapplied
            };
        }

        const selectedOffer = item.appliedOfferSnapshot || activeOffers.find(o => String(o.id) === String(rowOfferId));


        console.log(selectedOffer, "selectedOffer")

        // For return items, we use the snapshot/original offer and DO NOT validate if it's currently active.
        if (!selectedOffer || (!item.isReturn && !isOfferDateValid(selectedOffer))) {
            return {
                ...item,
                priceType: 'SalesPrice',
                price: currentItemPrice,
                appliedOfferName: null,
                offerReversal,
                offerReapplied
            };
        }

        appliedOfferName = selectedOffer.name;

        let keptQty = 0;
        let newQty = 0;
        let matchingReturns = [];
        let matchingNew = [];

        if (!item.isExchangeItem && !item.isReturn) {
            matchingReturns = returnItems.filter(r => {
                const isSameProduct = (r.itemId || r.id) === (item.itemId || item.id);
                if (isSameProduct) return false;
                return selectedOffer.scopeMode === 'Global';
            });
            matchingNew = newItems.filter(n => {
                const isSameProduct = (n.itemId || n.id) === (item.itemId || item.id);
                if (isSameProduct && n.isExchangeItem) return false;
                return isSameProduct || selectedOffer.scopeMode === 'Global';
            });
            keptQty = matchingReturns.reduce((sum, r) => sum + (parseFloat(r.originalQty || 0) - parseFloat(r.qty || 0)), 0);
            newQty = matchingNew.reduce((sum, n) => sum + parseFloat(n.qty || 0), 0);
        } else {
            matchingReturns = returnItems.filter(r => (r.itemId || r.id) === (item.itemId || item.id) || selectedOffer.scopeMode === 'Global');
            matchingNew = newItems.filter(n => {
                const isSameProduct = (n.itemId || n.id) === (item.itemId || item.id);
                if (isSameProduct && !n.isExchangeItem) return false;
                return isSameProduct || selectedOffer.scopeMode === 'Global';
            });
            keptQty = matchingReturns.reduce((sum, r) => sum + (parseFloat(r.originalQty || 0) - parseFloat(r.qty || 0)), 0);
            newQty = matchingNew.reduce((sum, n) => sum + parseFloat(n.qty || 0), 0);
        }

        console.log(matchingReturns, 'matchingReturns')
        console.log(matchingNew, 'matchingNew')

        const getPriceAtQty = (qtyToEvaluate, basePrice = salesPrice) => {

            console.log(basePrice, "basePrice", qtyToEvaluate)

            let offerPrice = basePrice;
            if (selectedOffer.discountType === 'Percentage') {
                offerPrice *= (1 - parseFloat(selectedOffer.discountValue || 0) / 100);
            } else if (selectedOffer.discountType === 'Fixed') {
                offerPrice = Math.max(0, basePrice - ((selectedOffer.discountValue || 0) / Math.max(1, qtyToEvaluate)));
            } else if (['Override', 'Volume'].includes(selectedOffer.discountType)) {
                const tier = [...(selectedOffer.OfferTier || [])].sort((a, b) => b.minQty - a.minQty)
                    .find(t => qtyToEvaluate >= t.minQty);
                if (tier) {
                    console.log(tier, "tier")
                    if (tier.type === 'Fixed') {
                        if (selectedOffer.discountType === 'Volume') {
                            offerPrice = Math.max(0, basePrice - (parseFloat(tier.value || 0) / Math.max(1, qtyToEvaluate)));
                        } else {
                            offerPrice = tier.value;
                        }
                    }
                    else offerPrice *= (1 - parseFloat(tier.value || 0) / 100);
                }
                console.log(offerPrice, "offerPrice",)

            }
            return Math.max(0, offerPrice);
        };

        if (item.isReturn) {
            // For return items, calculate Reversal based strictly on keptQty
            currentItemPrice = getPriceAtQty(keptQty);
            const originalOfferPrice = parseFloat(item.originalPrice || 0);


            console.log({
                currentItemPrice,
                originalOfferPrice,
                item,

            })


            if (currentItemPrice > originalOfferPrice) {
                // Tier broken or offer lost for the kept items
                offerReversal = (currentItemPrice - originalOfferPrice) * (item.originalQty - item.qty);
            } else {

            }
        } else {

            const evalQty = keptQty + newQty;
            currentItemPrice = getPriceAtQty(evalQty);


            // Reapplication: check if tier improved for the RETURN items by adding this new item
            let tierImproved = false;
            let totalRestoredAmount = 0;

            /* console.log removed */

            matchingReturns.forEach(r => {
                const rSalesPrice = parseFloat(r.originalSalesPrice || r.salesPrice || r.price || 0);
                const rOriginalOfferPrice = parseFloat(r.originalPrice || 0);

                const originalOffer = r.appliedOfferSnapshot || selectedOffer;

                const getPriceWithOffer = (qtyToEvaluate, basePrice, offerToUse) => {
                    let offerPrice = basePrice;
                    if (!offerToUse) return offerPrice;

                    if (offerToUse.discountType === 'Percentage') {
                        offerPrice *= (1 - parseFloat(offerToUse.discountValue || 0) / 100);
                    } else if (offerToUse.discountType === 'Fixed') {
                        offerPrice = Math.max(0, basePrice - ((offerToUse.discountValue || 0) / Math.max(1, qtyToEvaluate)));
                    } else if (['Override', 'Volume'].includes(offerToUse.discountType)) {
                        const tier = [...(offerToUse.OfferTier || [])].sort((a, b) => b.minQty - a.minQty)
                            .find(t => qtyToEvaluate >= t.minQty);
                        if (tier) {
                            if (tier.type === 'Fixed') {
                                if (offerToUse.discountType === 'Volume') {
                                    offerPrice = Math.max(0, basePrice - (parseFloat(tier.value || 0) / Math.max(1, qtyToEvaluate)));
                                } else {
                                    offerPrice = tier.value;
                                }
                            }
                            else offerPrice *= (1 - parseFloat(tier.value || 0) / 100);
                        }
                    }
                    return Math.max(0, offerPrice);
                };

                const priceForKeptOnly = getPriceWithOffer(keptQty, rSalesPrice, originalOffer);
                const priceWithNewItem = getPriceWithOffer(evalQty, rSalesPrice, originalOffer);

                console.log({
                    priceForKeptOnly,
                    priceWithNewItem
                })
                // If adding the new item makes the price for the return items CLOSER to the original offer price
                if (priceForKeptOnly > priceWithNewItem) {
                    tierImproved = true;

                    // How much penalty was there originally?
                    let originalPenalty = 0;
                    if (priceForKeptOnly > rOriginalOfferPrice) {
                        originalPenalty = (priceForKeptOnly - rOriginalOfferPrice) * (r.originalQty - r.qty);
                    }

                    // How much penalty is there NOW (with the new item)?
                    let newPenalty = 0;
                    if (priceWithNewItem > rOriginalOfferPrice) {
                        newPenalty = (priceWithNewItem - rOriginalOfferPrice) * (r.originalQty - r.qty);
                    }

                    // The amount restored is the difference
                    if (originalPenalty > newPenalty) {
                        totalRestoredAmount += (originalPenalty - newPenalty);
                    }

                    console.log({
                        originalPenalty,
                        newPenalty,
                        totalRestoredAmount,
                        tierImproved,
                        selectedOffer
                    })
                }


            });





            if (tierImproved && totalRestoredAmount > 0) {
                if (!reappliedTracker[selectedOffer.id]) {
                    offerReapplied = totalRestoredAmount;
                    reappliedTracker[selectedOffer.id] = true;
                } else {
                }
            } else {
            }
        }

        return {
            ...item,
            priceType: 'offerPrice',
            price: item.isReturn ? parseFloat(item.originalPrice || item.price || 0) : currentItemPrice,
            appliedOfferName,
            appliedOfferId: selectedOffer ? selectedOffer.id : null,
            appliedOfferSnapshot: selectedOffer ? selectedOffer : null,
            offerReversal,
            offerReapplied
        };
    });

    return { cartWithOffers: computed, appliedOffers: [] };
};








export const calculateCartWithOffers = (cart, selectedOffersByRow, potentialOffers, activeOffers) => {
    if (!cart?.length) return { cartWithOffers: [], appliedOffers: [] };

    const appliedSet = new Set();

    const computed = cart.map(item => {
        const cartKey = `${item.itemId || item.id}-${item.sizeId || 0}-${item.colorId || 0}-${item.barcodeType || ''}`;
        const rowOfferId = selectedOffersByRow[cartKey];

        if (!rowOfferId) {
            return {
                ...item,
                priceType: 'SalesPrice',
                price: item.salesPrice !== undefined ? item.salesPrice : (item.price || 0),
                appliedOfferName: null
            };
        }

        const selectedOffer = potentialOffers.find(o => String(o.id) === String(rowOfferId)) ||
            activeOffers.find(o => String(o.id) === String(rowOfferId));

        if (!selectedOffer || !isOfferDateValid(selectedOffer)) {
            return {
                ...item,
                priceType: 'SalesPrice',
                price: item.salesPrice !== undefined ? item.salesPrice : (item.price || 0),
                appliedOfferName: null
            };
        }

        appliedSet.add(selectedOffer);
        let currentItemPrice = item.salesPrice !== undefined ? parseFloat(item.salesPrice) : parseFloat(item.price || 0);

        if (selectedOffer.discountType === 'Percentage') {
            currentItemPrice *= (1 - parseFloat(selectedOffer.discountValue || 0) / 100);
        } else if (selectedOffer.discountType === 'Fixed') {
            currentItemPrice = Math.max(0, currentItemPrice - ((selectedOffer.discountValue || 0) / (parseFloat(item.qty) || 1)));
        } else if (['Override', 'Volume'].includes(selectedOffer.discountType)) {
            const evalQty = getOfferScopeQty(item, cart, selectedOffer);
            const tier = [...(selectedOffer.OfferTier || [])].sort((a, b) => b.minQty - a.minQty)
                .find(t => evalQty >= t.minQty);

            if (tier) {
                if (tier.type === 'Fixed') {
                    if (selectedOffer.discountType === 'Volume') {
                        currentItemPrice = Math.max(0, currentItemPrice - (parseFloat(tier.value || 0) / Math.max(1, evalQty)));
                    } else {
                        currentItemPrice = tier.value;
                    }
                }
                else currentItemPrice *= (1 - parseFloat(tier.value || 0) / 100);
            }
        }

        return {
            ...item,
            priceType: 'offerPrice',
            price: Math.max(0, currentItemPrice),
            appliedOfferName: selectedOffer.name,
            appliedOfferId: selectedOffer.id,
            appliedOfferSnapshot: selectedOffer
        };
    });

    return { cartWithOffers: computed, appliedOffers: Array.from(appliedSet) };
};


export const getItemApplicableOffers = (item, cartItems, activeOffers, collectionsData) => {
    if (!item || !activeOffers?.length) return [];

    /* console.log removed */;

    const isItemInScope = (itemId, off) => {
        if (off.scopeMode === 'Global') return true;
        if (off.scopeMode === 'Item') {
            return off.OfferScope?.some(s => String(s.refId) === String(itemId));
        }
        if (off.scopeMode === 'Collection') {
            return off.OfferScope?.some(scope => {
                if (scope.type !== 'Collection') return false;
                const matchedCollection = collectionsData?.data?.find(
                    col => String(col.id) === String(scope.refId)
                );
                if (!matchedCollection) return false;
                return matchedCollection.CollectionItems?.some(
                    ci => String(ci.itemId) === String(itemId)
                );
            });
        }
        return false;
    };

    const passesTypeCheck = (cartItem, off) => {
        if (cartItem.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
        if (cartItem.barcodeType === 'REGULAR' && !off.applyToRegular) return false;
        return true;
    };

    /* console.log removed */
    /* console.log removed */

    return activeOffers.map(off => {

        if (!isOfferDateValid(off)) {
            return null;
        }

        if (!passesTypeCheck(item, off)) {
            return null;
        }

        const itemQty = parseFloat(item.qty);
        if (!itemQty || itemQty <= 0) {
            return null;
        }

        const targetId = item.itemId ?? item.id;
        if (!isItemInScope(targetId, off)) {
            return null;
        }

        /* console.log removed */
        /* console.log removed */
        const inScopeItems = cartItems.filter(cit => {
            if (!passesTypeCheck(cit, off)) return false;
            const citQty = parseFloat(cit.qty);
            if (!citQty || citQty <= 0) return false;

            const isSameProduct = (cit.itemId ?? cit.id) === (item.itemId ?? item.id) &&
                (cit.sizeId || 0) === (item.sizeId || 0) &&
                (cit.colorId || 0) === (item.colorId || 0);

            if (isSameProduct) {
                if (item.isExchangeNewItem && !cit.isExchangeNewItem) return false;
                if (!item.isReturn && !item.isExchangeNewItem && cit.isExchangeNewItem) return false;
                if (item.isReturn && cit.isExchangeNewItem) return false;
            }

            const citId = cit.itemId ?? cit.id;
            return isItemInScope(citId, off);
        });

        const rules = off.OfferRule?.[0]?.conditions?.rules || [];
        let filteredScopeItems = [...inScopeItems];

        /* console.log removed */

        rules.forEach(rule => {
            if (rule.field === 'Sizes') {
                const sizeValues = Array.isArray(rule.value) ? rule.value : (typeof rule.value === 'string' ? rule.value.split(',') : []);
                const sizeIds = sizeValues.map(v => typeof v === 'object' ? String(v.value) : String(v));
                filteredScopeItems = filteredScopeItems.filter(cit => sizeIds.includes(String(cit.sizeId)));
            } else if (rule.field === 'Colors') {
                const colorValues = Array.isArray(rule.value) ? rule.value : (typeof rule.value === 'string' ? rule.value.split(',') : []);
                const colorIds = colorValues.map(v => typeof v === 'object' ? String(v.value) : String(v));
                filteredScopeItems = filteredScopeItems.filter(cit => colorIds.includes(String(cit.colorId)));
            }
        });

        /* console.log removed */
        /* console.log removed */

        const isCurrentItemMatching = filteredScopeItems.some(cit => {
            const citKey = `${cit.itemId || cit.id}-${cit.sizeId || 0}-${cit.colorId || 0}`;
            const itemKey = `${item.itemId || item.id}-${item.sizeId || 0}-${item.colorId || 0}`;
            return citKey === itemKey;
        });

        /* console.log removed */

        if (!isCurrentItemMatching) {
            return null;
        }

        const scopeQty = filteredScopeItems.reduce(
            (sum, i) => sum + (parseFloat(i.qty) || 0), 0
        );
        const scopeValue = filteredScopeItems.reduce(
            (sum, i) => sum + (parseFloat(i.price || i.salesPrice) || 0) * (parseFloat(i.qty) || 0), 0
        );

        if (!rules.length) {
            return { ...off, _metrics: { scopeQty, scopeValue } };
        }

        /* console.log removed */

        const results = rules.map((rule, ruleIdx) => {
            if (rule.field === 'Sizes' || rule.field === 'Colors') return true;

            if (rule.field === 'Variant Matrix') {
                const matrixRules = rule.matrix || [];
                const res = matrixRules.map((mRow, mIdx) => {
                    const matchQty = filteredScopeItems
                        .filter(cit => {
                            if (mRow.sizeId && String(cit.sizeId) !== String(mRow.sizeId)) return false;
                            if (mRow.colorId && String(cit.colorId) !== String(mRow.colorId)) return false;
                            return true;
                        })
                        .reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
                    const passed = matchQty >= parseFloat(mRow.qty);
                    return passed;
                });
                const finalMatrixResult = rule.logic === 'OR' ? res.some(r => r) : res.every(r => r);
                return finalMatrixResult;
            }

            if (rule.field === 'Unique Sizes') {
                const distinctSizes = new Set(filteredScopeItems.map(cit => String(cit.sizeId)));
                /* console.log removed */
                let passed = false;
                if (rule.operator === '>=') passed = distinctSizes.size >= parseFloat(rule.value);
                else if (rule.operator === '<=') passed = distinctSizes.size <= parseFloat(rule.value);
                else if (rule.operator === '==') passed = distinctSizes.size === parseFloat(rule.value);
                return passed;
            }

            if (rule.field === 'Unique Colors') {
                const distinctColors = new Set(filteredScopeItems.map(cit => String(cit.colorId)));
                let passed = false;
                if (rule.operator === '>=') passed = distinctColors.size >= parseFloat(rule.value);
                else if (rule.operator === '<=') passed = distinctColors.size <= parseFloat(rule.value);
                else if (rule.operator === '==') passed = distinctColors.size === parseFloat(rule.value);
                return passed;
            }

            if (rule.groupBy && rule.groupBy.length > 0) {
                const hasAllGroupFields = rule.groupBy.every(gField => {
                    if (gField === 'sizeId') return !!item.sizeId;

                    if (gField === 'colorId') return !!item.colorId;
                    if (gField === 'sameItem') return !!item.itemId || !!item.id;
                    return !!item[gField];
                });
                if (!hasAllGroupFields) {
                    return false;
                }

                const groups = {};
                const validScopeItems = filteredScopeItems.filter(cit => {
                    return rule.groupBy.every(gField => {
                        if (gField === 'sizeId') return !!cit.sizeId;
                        if (gField === 'colorId') return !!cit.colorId;
                        if (gField === 'sameItem') return !!cit.itemId || !!cit.id;
                        return !!cit[gField];
                    });
                });

                validScopeItems.forEach(cit => {
                    const key = rule.groupBy.map(gField => {
                        if (gField === 'sizeId') return cit.sizeId;
                        if (gField === 'colorId') return cit.colorId;
                        if (gField === 'sameItem') return cit.itemId || cit.id;
                        return cit[gField];
                    }).join('-');
                    const qty = parseFloat(cit.qty) || 0;
                    const val = ((parseFloat(cit.price || cit.salesPrice) || 0) * qty);
                    if (!groups[key]) groups[key] = { qty: 0, val: 0 };
                    groups[key].qty += qty;
                    groups[key].val += val;
                });

                const currentItemKey = rule.groupBy.map(gField => {
                    if (gField === 'sizeId') return item.sizeId;
                    if (gField === 'colorId') return item.colorId;
                    if (gField === 'sameItem') return item.itemId || item.id;
                    return item[gField];
                }).join('-');

                /* console.log removed */
                const itemGroup = groups[currentItemKey];
                let passed = false;
                if (itemGroup) {
                    const target = rule.field === 'Minimum Quantity' ? itemGroup.qty : (rule.field === 'Cart Value' ? itemGroup.val : 0);
                    if (rule.operator === '>=') passed = target >= parseFloat(rule.value);
                    else if (rule.operator === '<=') passed = target <= parseFloat(rule.value);
                    else if (rule.operator === '==') passed = target === parseFloat(rule.value);
                    else if (rule.operator === '<') passed = target < parseFloat(rule.value);
                    else if (rule.operator === '>') passed = target > parseFloat(rule.value);
                }
                return passed;
            }

            // Debug: log target computation for each rule
            const target =
                rule.field === 'Minimum Quantity' ? scopeQty :
                    rule.field === 'Cart Value' ? scopeValue : 0;


            // Evaluate rule operator against target
            let passed = false;
            if (rule.operator === '>=') passed = target >= parseFloat(rule.value);
            else if (rule.operator === '<=') passed = target <= parseFloat(rule.value);
            else if (rule.operator === '==') passed = target === parseFloat(rule.value);
            else if (rule.operator === '<') passed = target < parseFloat(rule.value);
            else if (rule.operator === '>') passed = target > parseFloat(rule.value);

            // Log target and related values before evaluation
            /* console.log removed */
            /* console.log removed */

            return passed;
        });

        /* console.log removed */


        const isMatched = off.OfferRule?.[0]?.logic === 'OR'
            ? results.some(r => r)
            : results.every(r => r);


        if (isMatched) {
            return { ...off, _metrics: { scopeQty, scopeValue } };
        }
        return null;
    }).filter(Boolean);
};
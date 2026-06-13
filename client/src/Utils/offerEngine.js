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
        return filteredItems.filter(cit => {
            return groupByKeys.every(gField => {
                if (gField === 'sizeId') return String(cit.sizeId) === String(item.sizeId);
                if (gField === 'colorId') return String(cit.colorId) === String(item.colorId);
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
                filteredScopeItems.forEach(item => {
                    const key = rule.groupBy.map(gField => {
                        if (gField === 'sizeId') return item.sizeId || '';
                        if (gField === 'colorId') return item.colorId || '';
                        return item[gField] || '';
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
                if (tier.type === 'Fixed') currentItemPrice = tier.value;
                else currentItemPrice *= (1 - parseFloat(tier.value || 0) / 100);
            }
        }

        return {
            ...item,
            priceType: 'offerPrice',
            price: Math.max(0, currentItemPrice),
            appliedOfferName: selectedOffer.name
        };
    });

    return { cartWithOffers: computed, appliedOffers: Array.from(appliedSet) };
};


export const getItemApplicableOffers = (item, cartItems, activeOffers, collectionsData) => {
    if (!item || !activeOffers?.length) return [];

    console.log("[OfferEngine Debug] Checking applicable offers for item:", {
        id: item.id,
        itemId: item.itemId,
        itemName: item.itemName || item.Item?.name,
        sizeId: item.sizeId,
        colorId: item.colorId,
        qty: item.qty,
        barcodeType: item.barcodeType
    });

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

    console.log(activeOffers, "activeOffers")
    return activeOffers.map(off => {
        console.log(`[OfferEngine Debug] Evaluating offer: "${off.name}" (ID: ${off.id})`);
        
        if (!isOfferDateValid(off)) {
            console.log(`[OfferEngine Debug]   Failed isOfferDateValid check for offer: ${off.name}`);
            return null;
        }

        if (!passesTypeCheck(item, off)) {
            console.log(`[OfferEngine Debug]   Failed passesTypeCheck for item. Item barcodeType: ${item.barcodeType}, Offer applyToRegular: ${off.applyToRegular}, applyToClearance: ${off.applyToClearance}`);
            return null;
        }

        const itemQty = parseFloat(item.qty);
        if (!itemQty || itemQty <= 0) {
            console.log(`[OfferEngine Debug]   Failed itemQty check: ${itemQty}`);
            return null;
        }

        const targetId = item.itemId ?? item.id;
        if (!isItemInScope(targetId, off)) {
            console.log(`[OfferEngine Debug]   Failed isItemInScope check. TargetId: ${targetId}, scopeMode: ${off.scopeMode}, scopeRefIds:`, off.OfferScope?.map(s => s.refId));
            return null;
        }

        const inScopeItems = cartItems.filter(cit => {
            if (!passesTypeCheck(cit, off)) return false;
            const citQty = parseFloat(cit.qty);
            if (!citQty || citQty <= 0) return false;
            const citId = cit.itemId ?? cit.id;
            return isItemInScope(citId, off);
        });
        console.log(`[OfferEngine Debug]   In-scope cart items:`, inScopeItems.map(i => ({ sizeId: i.sizeId, colorId: i.colorId, qty: i.qty })));

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

        const isCurrentItemMatching = filteredScopeItems.some(cit => {
            const citKey = `${cit.itemId || cit.id}-${cit.sizeId || 0}-${cit.colorId || 0}`;
            const itemKey = `${item.itemId || item.id}-${item.sizeId || 0}-${item.colorId || 0}`;
            return citKey === itemKey;
        });
        if (!isCurrentItemMatching) {
            console.log(`[OfferEngine Debug]   Current item is not matching in filteredScopeItems.`);
            return null;
        }

        const scopeQty = filteredScopeItems.reduce(
            (sum, i) => sum + (parseFloat(i.qty) || 0), 0
        );
        const scopeValue = filteredScopeItems.reduce(
            (sum, i) => sum + (parseFloat(i.price || i.salesPrice) || 0) * (parseFloat(i.qty) || 0), 0
        );

        if (!rules.length) {
            console.log(`[OfferEngine Debug]   No rules found. Offer is matched.`);
            return { ...off, _metrics: { scopeQty, scopeValue } };
        }

        console.log(filteredScopeItems, "filteredScopeItems")

        const results = rules.map((rule, ruleIdx) => {
            if (rule.field === 'Sizes' || rule.field === 'Colors') return true;

            if (rule.field === 'Variant Matrix') {
                const matrixRules = rule.matrix || [];
                console.log(`[OfferEngine Debug]   Rule ${ruleIdx + 1} (Variant Matrix): matrixRules:`, matrixRules);
                const res = matrixRules.map((mRow, mIdx) => {
                    const matchQty = filteredScopeItems
                        .filter(cit => {
                            if (mRow.sizeId && String(cit.sizeId) !== String(mRow.sizeId)) return false;
                            if (mRow.colorId && String(cit.colorId) !== String(mRow.colorId)) return false;
                            return true;
                        })
                        .reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
                    const passed = matchQty >= parseFloat(mRow.qty);
                    console.log(`[OfferEngine Debug]     Matrix Row ${mIdx + 1} (sizeId: ${mRow.sizeId}, colorId: ${mRow.colorId}): matched in-cart qty ${matchQty} vs required ${mRow.qty} => ${passed ? 'PASSED' : 'FAILED'}`);
                    return passed;
                });
                const finalMatrixResult = rule.logic === 'OR' ? res.some(r => r) : res.every(r => r);
                console.log(`[OfferEngine Debug]     Matrix Logic: ${rule.logic || 'AND'}, final result: ${finalMatrixResult}`);
                return finalMatrixResult;
            }

            if (rule.field === 'Unique Sizes') {
                const distinctSizes = new Set(filteredScopeItems.map(cit => String(cit.sizeId)));
                let passed = false;
                if (rule.operator === '>=') passed = distinctSizes.size >= parseFloat(rule.value);
                else if (rule.operator === '<=') passed = distinctSizes.size <= parseFloat(rule.value);
                else if (rule.operator === '==') passed = distinctSizes.size === parseFloat(rule.value);
                console.log(`[OfferEngine Debug]   Rule ${ruleIdx + 1} (Unique Sizes): distinct sizes count ${distinctSizes.size} vs ${rule.operator} ${rule.value} => ${passed ? 'PASSED' : 'FAILED'}`);
                return passed;
            }

            if (rule.field === 'Unique Colors') {
                const distinctColors = new Set(filteredScopeItems.map(cit => String(cit.colorId)));
                let passed = false;
                if (rule.operator === '>=') passed = distinctColors.size >= parseFloat(rule.value);
                else if (rule.operator === '<=') passed = distinctColors.size <= parseFloat(rule.value);
                else if (rule.operator === '==') passed = distinctColors.size === parseFloat(rule.value);
                console.log(`[OfferEngine Debug]   Rule ${ruleIdx + 1} (Unique Colors): distinct colors count ${distinctColors.size} vs ${rule.operator} ${rule.value} => ${passed ? 'PASSED' : 'FAILED'}`);
                return passed;
            }

            if (rule.groupBy && rule.groupBy.length > 0) {
                const groups = {};
                filteredScopeItems.forEach(cit => {
                    const key = rule.groupBy.map(gField => {
                        if (gField === 'sizeId') return cit.sizeId || '';
                        if (gField === 'colorId') return cit.colorId || '';
                        return cit[gField] || '';
                    }).join('-');
                    const qty = parseFloat(cit.qty) || 0;
                    const val = ((parseFloat(cit.price || cit.salesPrice) || 0) * qty);
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
                const passed = groupResults.some(r => r);
                console.log(`[OfferEngine Debug]   Rule ${ruleIdx + 1} (GroupBy ${rule.groupBy.join(',')}): Target field ${rule.field} ${rule.operator} ${rule.value} => ${passed ? 'PASSED' : 'FAILED'}`);
                return passed;
            }

            const target =
                rule.field === 'Minimum Quantity' ? scopeQty :
                    rule.field === 'Cart Value' ? scopeValue : 0;

            let passed = false;
            if (rule.operator === '>=') passed = target >= parseFloat(rule.value);
            else if (rule.operator === '<=') passed = target <= parseFloat(rule.value);
            else if (rule.operator === '==') passed = target === parseFloat(rule.value);
            else if (rule.operator === '<') passed = target < parseFloat(rule.value);
            else if (rule.operator === '>') passed = target > parseFloat(rule.value);
            console.log(`[OfferEngine Debug]   Rule ${ruleIdx + 1} (${rule.field}): target value ${target} vs ${rule.operator} ${rule.value} => ${passed ? 'PASSED' : 'FAILED'}`);
            return passed;
        });

        const isMatched = off.OfferRule?.[0]?.logic === 'OR'
            ? results.some(r => r)
            : results.every(r => r);

        console.log(`[OfferEngine Debug]   Final Match Result for "${off.name}": ${isMatched ? 'MATCHED' : 'NOT MATCHED'}`);

        if (isMatched) {
            return { ...off, _metrics: { scopeQty, scopeValue } };
        }
        return null;
    }).filter(Boolean);
};
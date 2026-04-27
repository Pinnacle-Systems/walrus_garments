/**
 * Offer Engine Utility
 * 
 * Shared logic for calculating applicable offers and final prices
 * for POS, Quotation, and Sale Order modules.
 */

/**
 * Identifies which offers are potentially applicable to the current cart/document
 * based on rules (Min Qty, Cart Value, Scope).
 */
export const getPotentialOffers = (activeOffers, cart) => {
    if (!activeOffers?.length || !cart?.length) return [];

    const potential = [];
    activeOffers.forEach(off => {
        const inScopeItems = cart.filter(item => {
            if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
            if (off.scopeMode === 'Global') return true;
            const targetId = item.itemId;
            if (off.scopeMode === 'Item' || off.scopeMode === 'Collection') {
                return off.OfferScope?.some(s => String(s.refId) === String(targetId));
            }
            return false;
        });
        if (!inScopeItems.length) return;

        const scopeQty = inScopeItems.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
        const scopeValue = inScopeItems.reduce((sum, i) => sum + ((parseFloat(i.salesPrice || i.price) || 0) * (parseFloat(i.qty) || 0)), 0);

        console.log(scopeValue, "scopeValue", scopeQty)

        const rules = off.OfferRule?.[0]?.conditions?.rules || [];
        const results = rules.map(rule => {
            const target = rule.field === 'Minimum Quantity' ? scopeQty : (rule.field === 'Cart Value' ? scopeValue : 0);
            if (rule.operator === '>=') return target >= parseFloat(rule.value);
            if (rule.operator === '<=') return target <= parseFloat(rule.value);
            if (rule.operator === '==') return target === parseFloat(rule.value);
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

            console.log(sortedTiers, "sortedTiers")
            const tier = sortedTiers.find(t => scopeQty >= t.minQty);

            console.log(tier, "tier")


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



        const cartKey = `${item.itemId || item.id}-${item.sizeId}-${item.colorId}-${item.barcodeType}`;
        const rowOfferId = selectedOffersByRow[cartKey];

        console.log(item, "item")
        console.log(selectedOffersByRow, "selectedOffersByRow")
        console.log(rowOfferId, "rowOfferId")
        console.log(activeOffers, 'activeOffers')
        console.log(potentialOffers, 'potentialOffers')

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

        console.log(selectedOffer, "selectedOffer")
        console.log(appliedSet, "appliedSet")

        if (!selectedOffer) {
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

            const tier = [...(selectedOffer.OfferTier || [])].sort((a, b) => b.minQty - a.minQty)
                .find(t => parseFloat(item.qty) >= t.minQty);

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

    console.log(computed, "computed")

    return { cartWithOffers: computed, appliedOffers: Array.from(appliedSet) };
};



// export const getItemApplicableOffers = (item, cartItems, activeOffers) => {
//     if (!item || !activeOffers?.length) return [];

//     return activeOffers.filter(off => {

//         // ✅ CLEARANCE Check
//         if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;

//         // ✅ REGULAR Check
//         if (item.barcodeType === 'REGULAR' && !off.applyToRegular) return false;

//         const targetId = item.itemId || item.id;
//         let isInScope = off.scopeMode === 'Global' ||
//             ((off.scopeMode === 'Item' || off.scopeMode === 'Collection') &&
//                 off.OfferScope?.some(s => String(s.refId) === String(targetId)));

//         if (!isInScope) return false;

//         const inScopeItems = cartItems.filter(cit => {
//             // ✅ CLEARANCE Check
//             if (cit.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
//             // ✅ REGULAR Check
//             if (cit.barcodeType === 'REGULAR' && !off.applyToRegular) return false;

//             const citId = cit.itemId || cit.id;
//             return off.scopeMode === 'Global' ||
//                 ((off.scopeMode === 'Item' || off.scopeMode === 'Collection') &&
//                     off.OfferScope?.some(s => String(s.refId) === String(citId)));
//         });

//         const scopeQty = inScopeItems.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
//         const scopeValue = inScopeItems.reduce((sum, i) => sum + ((parseFloat(i.price) || 0) * (parseFloat(i.qty) || 0)), 0);

//         const rules = off.OfferRule?.[0]?.conditions?.rules || [];
//         const results = rules.map(rule => {
//             const target = rule.field === 'Minimum Quantity' ? scopeQty : (rule.field === 'Cart Value' ? scopeValue : 0);
//             if (rule.operator === '>=') return target >= parseFloat(rule.value);
//             if (rule.operator === '<=') return target <= parseFloat(rule.value);
//             if (rule.operator === '==') return target === parseFloat(rule.value);
//             return true;
//         });

//         return off.OfferRule?.[0]?.logic === 'OR' ? results.some(r => r) : results.every(r => r);
//     });
// };


export const getItemApplicableOffers = (item, cartItems, activeOffers, collectionsData) => {
    if (!item || !activeOffers?.length) return [];

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

    return activeOffers.map(off => {
        if (!passesTypeCheck(item, off)) return null;

        const itemQty = parseFloat(item.qty);
        if (!itemQty || itemQty <= 0) return null;

        const targetId = item.itemId ?? item.id;
        if (!isItemInScope(targetId, off)) return null;

        const inScopeItems = cartItems.filter(cit => {
            if (!passesTypeCheck(cit, off)) return false;
            const citQty = parseFloat(cit.qty);
            if (!citQty || citQty <= 0) return false;
            const citId = cit.itemId ?? cit.id;
            return isItemInScope(citId, off);
        });

        const scopeQty = inScopeItems.reduce(
            (sum, i) => sum + (parseFloat(i.qty) || 0), 0
        );
        const scopeValue = inScopeItems.reduce(
            (sum, i) => sum + (parseFloat(i.price) || 0) * (parseFloat(i.qty) || 0), 0
        );

        const rules = off.OfferRule?.[0]?.conditions?.rules || [];
        if (!rules.length) return null;

        const results = rules.map(rule => {
            const target =
                rule.field === 'Minimum Quantity' ? scopeQty :
                    rule.field === 'Cart Value' ? scopeValue : 0;

            if (rule.operator === '>=') return target >= parseFloat(rule.value);
            if (rule.operator === '<=') return target <= parseFloat(rule.value);
            if (rule.operator === '==') return target === parseFloat(rule.value);
            return false;
        });

        const isMatched = off.OfferRule?.[0]?.logic === 'OR'
            ? results.some(r => r)
            : results.every(r => r);

        if (isMatched) {
            return { ...off, _metrics: { scopeQty, scopeValue } };
        }
        return null;
    }).filter(Boolean);
};
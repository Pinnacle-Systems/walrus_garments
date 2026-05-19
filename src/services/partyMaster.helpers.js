export const filterInwardReturnParties = (data) => {
    return data.filter(party => {

        const Inward = party.DirectInwardOrReturn.reduce((partySum, supplier) => {
            const inwardQty = supplier.DirectItems.reduce(
                (sum, item) => sum + (item.qty || 0),
                0
            );
            return partySum + inwardQty;
        }, 0);

        const Return = party.DirectReturnOrPoReturn.reduce((partySum, invoice) => {
            const returnQty = invoice.directReturnItems.reduce(
                (sum, item) => sum + (item.qty || 0),
                0
            );
            return partySum + returnQty;
        }, 0);

        console.log({ Inward, Return }, "invoiceQty");

        return Inward > 0 && Inward != Return;
    });
};

export const filterBillableParties = (data) => {
    console.log("data", data);

    return data.filter(party => {
        const hasSaleOrder = (party.Saleorder && party.Saleorder.length > 0) ||
            (party._count && party._count.Saleorder > 0);

        const hasQuotation = (party.Quotation && party.Quotation.length > 0) ||
            (party._count && party._count.Quotation > 0);

        // If party has sale orders (quotation was converted)

        if (hasSaleOrder && party.Saleorder && party.Saleorder.length > 0) {

            // Only show if at least one sale order is NOT fully delivered
            return party.Saleorder.some(so => {
                const totalOrdered = (so.SaleOrderItems || []).reduce(
                    (acc, item) => acc + parseFloat(item.qty || 0), 0
                );
                const totalDelivered = (so.SalesDelivery || []).reduce((acc, sd) => {
                    return acc + (sd.SalesDeliveryItems || []).reduce(
                        (acc2, item) => acc2 + parseFloat(item.deliveryQty || 0), 0
                    );
                }, 0);
                return totalOrdered > (totalDelivered + 0.0001);
            });
        }

        // If only quotation exists (not converted to SO), show the party
        if (hasQuotation && !hasSaleOrder) return true;

        return false;
    });
};

export const filterReturnBillableParties = (data) => {
    return data.reduce((acc, party) => {
        const ledgerDebit = (party.Ledger || []).filter(l => l.creditOrDebit === 'Debit').reduce((sum, l) => sum + (l.amount || 0), 0);
        const ledgerCredit = (party.Ledger || []).filter(l => l.creditOrDebit === 'Credit').reduce((sum, l) => sum + (l.amount || 0), 0);

        // 🔹 Consolidated Delivery Value from Ledger (Now includes Sales Delivery, Returns, and POS)
        const totalDeliveryValue = ledgerDebit - ledgerCredit;

        const totalReceiptAmount = (party.Payment || []).filter(pay => pay.paymentFlow !== "Payout").reduce((sum, pay) => sum + parseFloat(pay.paidAmount || 0), 0);
        const totalPayoutAmount = (party.Payment || []).filter(pay => pay.paymentFlow === "Payout").reduce((sum, pay) => sum + parseFloat(pay.paidAmount || 0), 0);
        const totalPayments = totalReceiptAmount - totalPayoutAmount;

        const outstandingBalance = Math.round((totalDeliveryValue - totalPayments) * 100) / 100;

        // "நாம தர வேண்டிய amount" என்றால் outstanding balance negative-ஆக இருக்கும்.
        // உதாரணத்திற்கு: Sales(100) - Receipt(150) = -50 (நாம தரணும்)
        if (outstandingBalance < 0) {
            acc.push({
                ...party,
                totalDeliveryValue: Math.round(totalDeliveryValue * 100) / 100,
                totalReceiptAmount: Math.round(totalReceiptAmount * 100) / 100,
                totalPayoutAmount: Math.round(totalPayoutAmount * 100) / 100,
                totalPayments: Math.round(totalPayments * 100) / 100,
                outstandingBalance: Math.abs(outstandingBalance) // தேவைப்பட்டால் positive ஆக மாற்றி காட்டலாம்
            });
        }
        return acc;
    }, []);
};

export const mapPaymentOutstandingParties = (data) => {
    return data.map(party => {
        const ledgerDebit = (party.Ledger || []).filter(l => l.creditOrDebit === 'Debit').reduce((acc, l) => acc + (l.amount || 0), 0);
        const ledgerCredit = (party.Ledger || []).filter(l => l.creditOrDebit === 'Credit').reduce((acc, l) => acc + (l.amount || 0), 0);

        // 🔹 Consolidated Delivery Value from Ledger (Now includes Sales Delivery, Returns, and POS)
        const totalDeliveryValue = ledgerDebit - ledgerCredit;

        const totalReceiptAmount = (party.Payment || []).filter(pay => pay.paymentFlow !== "Payout").reduce((acc, pay) => acc + parseFloat(pay.paidAmount || 0), 0);
        const totalPayoutAmount = (party.Payment || []).filter(pay => pay.paymentFlow === "Payout").reduce((acc, pay) => acc + parseFloat(pay.paidAmount || 0), 0);
        const totalPayments = totalReceiptAmount - totalPayoutAmount;

        return {
            ...party,
            totalDeliveryValue: Math.round(totalDeliveryValue * 100) / 100,
            totalReceiptAmount: Math.round(totalReceiptAmount * 100) / 100,
            totalPayoutAmount: Math.round(totalPayoutAmount * 100) / 100,
            totalPayments: Math.round(totalPayments * 100) / 100,
            outstandingBalance: Math.round((totalDeliveryValue - totalPayments) * 100) / 100
        };
    });
};


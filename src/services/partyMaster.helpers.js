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

        // Calculate if customer has credit value
        const creditValue = (party.Ledger || []).filter(l =>
            (l.EntryType === 'Credit_Note' && l.creditOrDebit === 'Credit') ||
            (l.EntryType === 'Debit_Note')
        ).reduce((acc, l) => acc + (l.amount || 0), 0);

        const hasCredit = creditValue > 0;

        // If party has credit, immediately allow it to be shown
        if (hasCredit) return true;

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

// export const filterReturnBillableParties = (data) => {
//     return data.reduce((acc, party) => {
//         const ledgerDebit = (party.Ledger || []).filter(l => l.creditOrDebit === 'Debit').reduce((sum, l) => sum + (l.amount || 0), 0);
//         const ledgerCredit = (party.Ledger || []).filter(l => l.creditOrDebit === 'Credit').reduce((sum, l) => sum + (l.amount || 0), 0);

//         const totalDeliveryValue = ledgerDebit - ledgerCredit;

//         const totalReceiptAmount = (party.Payment || []).filter(pay => pay.paymentFlow !== "Payout").reduce((sum, pay) => sum + parseFloat(pay.paidAmount || 0), 0);
//         const totalPayoutAmount = (party.Payment || []).filter(pay => pay.paymentFlow === "Payout").reduce((sum, pay) => sum + parseFloat(pay.paidAmount || 0), 0);
//         const totalPayments = totalReceiptAmount - totalPayoutAmount;

//         const outstandingBalance = Math.round((totalDeliveryValue - totalPayments) * 100) / 100;


//         if (outstandingBalance < 0) {
//             acc.push({
//                 ...party,
//                 totalDeliveryValue: Math.round(totalDeliveryValue * 100) / 100,
//                 totalReceiptAmount: Math.round(totalReceiptAmount * 100) / 100,
//                 totalPayoutAmount: Math.round(totalPayoutAmount * 100) / 100,
//                 totalPayments: Math.round(totalPayments * 100) / 100,
//                 outstandingBalance: Math.abs(outstandingBalance)
//             });
//         }
//         return acc;
//     }, []);
// };

export const mapPaymentOutstandingParties = (data) => {
    return data.map(party => {
        const ledgerDebit = (party.Ledger || []).filter(l => l.creditOrDebit === 'Debit').reduce((acc, l) => acc + (l.amount || 0), 0);
        const ledgerCredit = (party.Ledger || []).filter(l => l.creditOrDebit === 'Credit').reduce((acc, l) => acc + (l.amount || 0), 0);

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


export const filterReturnBillableParties = (data) => {
    const results = [];

    for (const party of data) {
        // --- CREDITS ---
        const customerPayment = (party.Ledger || [])
            .filter(l => l.creditOrDebit === 'Credit' && l.EntryType === 'Customer_Payment')
            .reduce((sum, l) => sum + (l.amount || 0), 0);

        const creditNote = (party.Ledger || [])
            .filter(l => l.creditOrDebit === 'Credit' && l.EntryType === 'Credit_Note')
            .reduce((sum, l) => sum + (l.amount || 0), 0);

        const creditAdjustment = (party.Ledger || [])
            .filter(l => l.creditOrDebit === 'Credit' && l.EntryType === 'Credit_Adjustment')
            .reduce((sum, l) => sum + (l.amount || 0), 0);

        // --- DEBITS ---
        const sales = (party.Ledger || [])
            .filter(l => l.creditOrDebit === 'Debit' && l.EntryType === 'Sales')
            .reduce((sum, l) => sum + (l.amount || 0), 0);

        const debitAdjustment = (party.Ledger || [])
            .filter(l => l.creditOrDebit === 'Debit' && l.EntryType === 'Debit_Adjustment')
            .reduce((sum, l) => sum + (l.amount || 0), 0);

        // --- BALANCE ---
        const totalCredit = customerPayment + creditNote;
        const totalDebit = sales + debitAdjustment + creditAdjustment;
        const outstandingBalance = Math.round((totalCredit - totalDebit) * 100) / 100;

        console.log({
            partyName: party.name,
            customerPayment,
            creditNote,
        })
        console.log({
            partyName: party.name,
            sales,
            debitAdjustment,
            creditAdjustment
        })


        if (outstandingBalance > 0) {
            results.push({
                ...party,
                ledgerBreakdown: {
                    customerPayment: Math.round(customerPayment * 100) / 100,
                    creditNote: Math.round(creditNote * 100) / 100,
                    creditAdjustment: Math.round(creditAdjustment * 100) / 100,
                    sales: Math.round(sales * 100) / 100,
                    debitAdjustment: Math.round(debitAdjustment * 100) / 100,
                    totalCredit: Math.round(totalCredit * 100) / 100,
                    totalDebit: Math.round(totalDebit * 100) / 100,
                },
                outstandingBalance,
            });
        }
    }

    return results;
};
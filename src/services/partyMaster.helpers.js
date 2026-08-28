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

    return data.filter(party => {
        const hasSaleOrder = (party.Saleorder && party.Saleorder.length > 0) ||
            (party._count && party._count.Saleorder > 0);

        // A quotation is pending if it has NOT been converted to a Sale Order
        const hasPendingQuotation = party.Quotation && party.Quotation.some(q =>
            !q.Saleorder || q.Saleorder.length === 0
        );

        const creditValue = (party.Ledger || []).filter(l =>
            (l.EntryType === 'Customer_Payment' && l.creditOrDebit === 'Credit')
        ).reduce((acc, l) => acc + (l.amount || 0), 0);

        const DebitValue = (party.Ledger || []).filter(l =>
            (l.EntryType === 'Sales' && l.creditOrDebit === 'Debit')
        ).reduce((acc, l) => acc + (l.amount || 0), 0);

        const Credit_Adjustment = (party.Ledger || []).filter(l =>
            l.EntryType === 'Credit_Adjustment'
        ).reduce((sum, l) => sum + (l.amount || 0), 0);

        const Debit_Adjustment = (party.Ledger || []).filter(l =>
            l.EntryType === 'Debit_Adjustment'
        ).reduce((sum, l) => sum + (l.amount || 0), 0);

        const hasCredit = creditValue - DebitValue + (Credit_Adjustment - Debit_Adjustment) > 0;

        console.log(party.name, party.Quotation?.length, party.Saleorder?.length, "party.Quotation");

        if (hasCredit) return true;

        let hasPendingSaleOrder = false;
        if (hasSaleOrder && party.Saleorder && party.Saleorder.length > 0) {
            // Only show if at least one sale order is NOT fully delivered
            hasPendingSaleOrder = party.Saleorder.some(so => {
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

        if (hasPendingSaleOrder) return true;

        if (hasPendingQuotation) return true;

        return false;
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


export const mapPaymentOutstandingParties = (data) => {
    return data.map(party => {
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
        const outstandingBalance = Math.round((totalDebit - totalCredit) * 100) / 100;

        return {
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
        };
    });
};
import moment from "moment"
import { prisma } from '../lib/prisma.js';


export async function getPartyLedgerReportCus(partyId, startDate, endDate) {
    console.log(partyId, "partyIdsss")
    const startDateFormatted = moment(startDate).format("YYYY-MM-DD");
    const endDateFormatted = moment(endDate).format("YYYY-MM-DD");
    const openingBalanceResults = await prisma.$queryRaw`
    select coalesce(sum(amount),0) as openingBalance from (select 'Purchase' as type, docId as transId, selectedDate as date, coalesce(ourPrice,0) as amount,'' as discount
from purchasebill
where  supplierId = ${partyId} and (DATE(selectedDate) < ${startDateFormatted})
union
select 'Payment' as type, docId as transId, cvv as date, 0 - coalesce(paidAmount,0), discount as discount
from payment
where  partyid = ${partyId} and paymentType = 'PURCHASEBILL' and (DATE(cvv) < ${startDateFormatted})) a
    `;

    const closingBalanceResults = await prisma.$queryRaw`
    select coalesce(sum(amount),0) as closingBalance from (select 'Purchase' as type, docId as transId, selectedDate as date, ourPrice as amount,'' as discount
from purchasebill
where supplierId = ${partyId} and (DATE(selectedDate) <= ${endDateFormatted})
union
select 'Payment' as type, docId as transId, cvv as date, 0 - paidAmount - discount, discount as discount
from payment
where  partyid = ${partyId} and paymentType = 'PURCHASEBILL' and (DATE(cvv) <= ${endDateFormatted})) a
    `;

    const data = await prisma.$queryRaw`
   select * from (select 'Purchase' as type, docId as transId, selectedDate as date, ourPrice as amount, '' as paymentType ,'' as paymentRefNo,'' as discount
from purchasebill
where supplierId = ${partyId} and (DATE(selectedDate) between ${startDateFormatted} and ${endDateFormatted})
union
select 'Payment' as type, docId as transId, cvv as date, paidAmount+ discount,paymentMode as paymentType, paymentRefNo, discount as discount
from payment 
where partyid = ${partyId} and paymentType = 'PURCHASEBILL' and (DATE(cvv) between ${startDateFormatted} and ${endDateFormatted})) a
order by date;
    `;
    const partyDetails = await prisma.party.findUnique({
        where: {
            id: parseInt(partyId)
        },
        select: {
            name: true,
            soa: true
        }
    })
    console.log(typeof partyDetails.coa)
    return {
        openingBalance: parseFloat(openingBalanceResults[0]?.openingBalance) + parseFloat(partyDetails.soa),
        closingBalance: parseFloat(closingBalanceResults[0]?.closingBalance) + parseFloat(partyDetails.soa),
        data,
        partyDetails
    }
}


export async function getPartyLedgerReport(partyId, startDate, endDate) {
    console.log(partyId, "partyId")
    const startDateFormatted = moment(startDate).format("YYYY-MM-DD");
    const endDateFormatted = moment(endDate).format("YYYY-MM-DD");

    const sql = `
WITH opening AS (
    SELECT
        p.id AS partyId,
        COALESCE(sd_sum.totalSales, 0)
        - COALESCE(sr_sum.totalReturns, 0)
        - COALESCE(pmt_sum.totalPaid, 0) AS openingBalance
    FROM Party p
    -- 🔹 Old Sales Delivery (Summing Items: deliveryQty * price)
    LEFT JOIN (
        SELECT sd.customerId, 
               SUM(COALESCE(CAST(sdi.deliveryQty AS DECIMAL(10,2)), 0) * COALESCE(CAST(sdi.price AS DECIMAL(10,2)), 0)) AS totalSales
        FROM SalesDelivery sd
        JOIN SalesDeliveryItems sdi ON sd.id = sdi.salesDeliveryId
        WHERE sd.createdAt < '${startDateFormatted}'
          AND sd.isDeleted = 0
        GROUP BY sd.customerId
    ) sd_sum ON sd_sum.customerId = p.id
    -- 🔹 Old Sales Return (Summing Items: qty * price)
    LEFT JOIN (
        SELECT sr.customerId, 
               SUM(COALESCE(CAST(sri.qty AS DECIMAL(10,2)), 0) * COALESCE(CAST(sri.price AS DECIMAL(10,2)), 0)) AS totalReturns
        FROM SalesReturn sr
        JOIN SalesReturnItems sri ON sr.id = sri.salesReturnId
        WHERE sr.createdAt < '${startDateFormatted}'
          AND sr.isDeleted = 0
        GROUP BY sr.customerId
    ) sr_sum ON sr_sum.customerId = p.id
    -- 🔹 Old Payments (Before Start Date)
    LEFT JOIN (
        SELECT partyId, 
               SUM(CASE WHEN paymentFlow = 'Payout' THEN -totalAmount ELSE totalAmount END) AS totalPaid
        FROM Payment
        WHERE cvv < '${startDateFormatted}'
          AND isDeleted = 0
        GROUP BY partyId
    ) pmt_sum ON pmt_sum.partyId = p.id
    WHERE p.id = ${partyId}
),

txns AS (
    -- 🔹 SALES DELIVERY (DEBIT - Summing Items)
    SELECT
        sd.docId AS transactionId,
        sd.createdAt AS txnDateTime,
        'SALES' AS txnType,
        SUM(COALESCE(CAST(sdi.deliveryQty AS DECIMAL(10,2)), 0) * COALESCE(CAST(sdi.price AS DECIMAL(10,2)), 0)) AS debit,
        0 AS credit
    FROM SalesDelivery sd
    JOIN SalesDeliveryItems sdi ON sd.id = sdi.salesDeliveryId
    WHERE sd.customerId = ${partyId}
      AND sd.createdAt >= '${startDateFormatted}'
      AND sd.createdAt < DATE_ADD('${endDateFormatted}', INTERVAL 1 DAY)
      AND sd.isDeleted = 0
    GROUP BY sd.id, sd.docId, sd.createdAt

    UNION ALL

    -- 🔹 SALES RETURN (CREDIT - Summing Items)
    SELECT
        sr.docId AS transactionId,
        sr.createdAt AS txnDateTime,
        'RETURN' AS txnType,
        0 AS debit,
        SUM(COALESCE(CAST(sri.qty AS DECIMAL(10,2)), 0) * COALESCE(CAST(sri.price AS DECIMAL(10,2)), 0)) AS credit
    FROM SalesReturn sr
    JOIN SalesReturnItems sri ON sr.id = sri.salesReturnId
    WHERE sr.customerId = ${partyId}
      AND sr.createdAt >= '${startDateFormatted}'
      AND sr.createdAt < DATE_ADD('${endDateFormatted}', INTERVAL 1 DAY)
      AND sr.isDeleted = 0
    GROUP BY sr.id, sr.docId, sr.createdAt

    UNION ALL

    -- 🔹 PAYMENT (CREDIT/DEBIT based on flow)
    SELECT
        docId AS transactionId,
        cvv AS txnDateTime, 
        'PAYMENT' AS txnType,
        CASE WHEN paymentFlow = 'Payout' THEN totalAmount ELSE 0 END AS debit,
        CASE WHEN paymentFlow = 'Payout' THEN 0 ELSE totalAmount END AS credit
    FROM Payment
    WHERE partyId = ${partyId}
      AND cvv >= '${startDateFormatted}'
      AND cvv < DATE_ADD('${endDateFormatted}', INTERVAL 1 DAY)
      AND isDeleted = 0
)

-- 🔹 1. OPENING BALANCE ROW
SELECT
    NULL AS transactionId,
    CONCAT('${startDateFormatted}', ' 00:00:00') AS txnDateTime,
    'OPENING BALANCE' AS txnType,
    CASE WHEN openingBalance > 0 THEN openingBalance ELSE 0 END AS debit,
    CASE WHEN openingBalance < 0 THEN ABS(openingBalance) ELSE 0 END AS credit,
    openingBalance AS runningBalance
FROM opening

UNION ALL

-- 🔹 2. TRANSACTIONS WITH RUNNING BALANCE
SELECT
    t.transactionId,
    t.txnDateTime,
    t.txnType,
    t.debit,
    t.credit,
    o.openingBalance
    + SUM(t.debit - t.credit)
        OVER (
            ORDER BY t.txnDateTime, t.transactionId
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS runningBalance
FROM txns t
CROSS JOIN opening o

ORDER BY txnDateTime, transactionId;
`

    const data = await prisma.$queryRawUnsafe(sql);
    console.log(sql, "sql fro report")

    return {
        data,
    }
}


export async function getPartyPurchaseOverAllReport(searchPartyName) {
    const sql = `SELECT 
    id, 
    name, 
    FORMAT(SUM(purchaseAmount), 2) AS purchaseAmount, 
    FORMAT(SUM(paymentAmount), 2) AS paymentAmount, 
    FORMAT(SUM(purchaseAmount) - SUM(paymentAmount), 2) AS balance
FROM (
    SELECT 
        party.id,
        party.name, 
        0 AS purchaseAmount, 
        0 AS paymentAmount 
    FROM 
        party
         WHERE 
       isSupplier = 1
 

    UNION ALL

    SELECT 
        party.id, 
        party.name, 
        SUM(purchaseBill.netBillValue) AS purchaseAmount, 
        0 AS paymentAmount
    FROM 
        purchaseBill 
    JOIN 
        party 
    ON 
        party.id = purchaseBill.supplierId
   WHERE 
       isSupplier = 1
    GROUP BY 
        purchaseBill.supplierId, 
        party.name

    UNION ALL

    SELECT 
        party.id, 
        party.name, 
        0 AS purchaseAmount, 
        SUM(payment.paidAmount) AS paymentAmount
    FROM 
        payment 
    JOIN 
        party 
    ON 
        party.id = payment.partyId
        
        where paymentType = 'PURCHASEBILL'
         AND
       party.isSupplier = 1
  
    GROUP BY 
        payment.partyId, 
        party.name
) a 
where a.name like '%${searchPartyName}%'
GROUP BY 
    id, 
    name
HAVING 
    SUM(purchaseAmount) > 0 OR SUM(paymentAmount) > 0 
ORDER BY 
    name
`
    return await prisma.$queryRawUnsafe(sql)
}




export async function getPartyOverAllReport(searchPartyName, date) {

    const DateFormatted = moment(date).format("YYYY-MM-DD");


    //     const sql = `
    // SELECT
    //     p.id,
    //     p.name,

    //     -- Opening balance
    //     COALESCE(p.coa, 0) AS openingBalance,

    //     -- Ledger amount (all previous + selected date)
    //     COALESCE(l.ledgerAmount, 0) AS ledgerAmount,

    //     -- Paid amount (all previous + selected date)
    //     COALESCE(pay.paidAmount, 0) AS paidAmount,

    //     -- Outstanding = Opening + Ledger - Payment
    //     (
    //         COALESCE(p.coa, 0)
    //         + COALESCE(l.ledgerAmount, 0)
    //         - COALESCE(pay.paidAmount, 0)
    //     ) AS outstandingAmount

    // FROM party p

    // -- 🔹 Ledger (all invoices till selected date)
    // LEFT JOIN (
    //     SELECT
    //         partyId,
    //         SUM(amount) AS ledgerAmount
    //     FROM Ledger
    //     WHERE creditOrDebit = 'Credit'
    //       AND createdAt < DATE_ADD('${DateFormatted}', INTERVAL 1 DAY)
    //     GROUP BY partyId
    // ) l ON p.id = l.partyId

    // -- 🔹 Payment (all payments till selected date)
    // LEFT JOIN (
    //     SELECT
    //         partyId,
    //         SUM(totalAmount) AS paidAmount
    //     FROM Payment
    //     WHERE cvv < DATE_ADD('${DateFormatted}', INTERVAL 1 DAY)
    //     GROUP BY partyId
    // ) pay ON p.id = pay.partyId

    // WHERE p.name LIKE '%${searchPartyName}%'
    // ORDER BY p.name;

    // `

    //     const sql = `
    // SELECT
    //     p.id,

    //     TRIM(
    //         CONCAT(
    //             p.name,
    //             IF(bt.name IS NOT NULL, CONCAT(' / ', bt.name), ''),
    //             IF(c.name IS NOT NULL, CONCAT(' / ', c.name), '')
    //         )
    //     ) AS name,

    //     COALESCE(p.coa, 0) AS openingBalance,

    //     COALESCE(l.ledgerAmount, 0) AS ledgerAmount,

    //     COALESCE(pay.paidAmount, 0) AS paidAmount,

    //     (
    //         COALESCE(p.coa, 0)
    //         + COALESCE(l.ledgerAmount, 0)
    //         - COALESCE(pay.paidAmount, 0)
    //     ) AS outstandingAmount

    // FROM party p

    // -- 🔹 Branch Type
    // LEFT JOIN BranchType bt ON bt.id = p.branchTypeId

    // -- 🔹 City
    // LEFT JOIN City c ON c.id = p.cityId

    // -- 🔹 Ledger
    // LEFT JOIN (
    //     SELECT
    //         partyId,
    //         SUM(amount) AS ledgerAmount
    //     FROM Ledger
    //     WHERE creditOrDebit = 'Credit'
    //       AND createdAt < DATE_ADD('${DateFormatted}', INTERVAL 1 DAY)
    //     GROUP BY partyId
    // ) l ON p.id = l.partyId

    // -- 🔹 Payment
    // LEFT JOIN (
    //     SELECT
    //         partyId,
    //         SUM(totalAmount) AS paidAmount
    //     FROM Payment
    //     WHERE cvv <  DATE_ADD('${DateFormatted}', INTERVAL 1 DAY)
    //     GROUP BY partyId
    // ) pay ON p.id = pay.partyId

    // WHERE p.name LIKE '%${searchPartyName}%'
    // ORDER BY name;


    // `
    const sql = `
SELECT
    p.id,

    TRIM(
        CONCAT(
            p.name,
            IF(bt.name IS NOT NULL, CONCAT(' / ', bt.name), ''),
            IF(c.name IS NOT NULL, CONCAT(' / ', c.name), '')
        )
    ) AS name,

    COALESCE(l.ledgerAmount, 0) AS ledgerAmount,

    COALESCE(pay.paidAmount, 0) AS paidAmount,

    (
        COALESCE(l.ledgerAmount, 0)
        - COALESCE(pay.paidAmount, 0) 
    ) AS outstandingAmount

FROM party p

-- 🔹 Branch Type
LEFT JOIN BranchType bt ON bt.id = p.branchTypeId

-- 🔹 City
LEFT JOIN City c ON c.id = p.cityId

-- 🔹 Ledger
LEFT JOIN (
    SELECT
        partyId,
        SUM(amount) AS ledgerAmount
    FROM Ledger
    WHERE creditOrDebit = 'Credit'
      AND createdAt < DATE_ADD('${DateFormatted}', INTERVAL 1 DAY)
    GROUP BY partyId
) l ON p.id = l.partyId

-- 🔹 Payment
LEFT JOIN (
    SELECT
        partyId,
        SUM(totalAmount) AS paidAmount
    FROM Payment
    WHERE cvv <  DATE_ADD('${DateFormatted}', INTERVAL 1 DAY)
    GROUP BY partyId
) pay ON p.id = pay.partyId

WHERE p.name LIKE '%${searchPartyName}%'
ORDER BY name;


`

    console.log(sql, "sql for overall outsatnding")

    return await prisma.$queryRawUnsafe(sql)
}
import React, { useState, useMemo } from 'react';
import { Printer, RefreshCw, Smartphone, Monitor } from 'lucide-react';
import moment from 'moment';

// --- Monospace Align & Padding Helpers ---
const padRight = (str, len) => {
    const s = String(str || "");
    return s.padEnd(len, " ");
};

const padLeft = (str, len) => {
    const s = String(str || "");
    return s.padStart(len, " ");
};

const padCenter = (str, len) => {
    const s = String(str || "");
    if (s.length >= len) return s.substring(0, len);
    const remaining = len - s.length;
    const left = Math.floor(remaining / 2);
    const right = remaining - left;
    return " ".repeat(left) + s + " ".repeat(right);
};

const wrapText = (text, maxLen) => {
    if (!text) return [""];
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (let word of words) {
        if ((currentLine + word).length <= maxLen) {
            currentLine += (currentLine ? " " : "") + word;
        } else {
            if (currentLine) lines.push(currentLine);
            if (word.length > maxLen) {
                let temp = word;
                while (temp.length > maxLen) {
                    lines.push(temp.substring(0, maxLen));
                    temp = temp.substring(maxLen);
                }
                currentLine = temp;
            } else {
                currentLine = word;
            }
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
};

// Generates formatted item lines with columns aligning correctly
const formatItemRow = (name, variantInfo, qty, rate, amount, widths) => {
    const nameLines = wrapText(name, widths[0]);
    const lines = [];

    // Print first line with Qty, Rate, and Amount columns aligned
    lines.push(
        padRight(nameLines[0] || "", widths[0]) +
        padLeft(qty, widths[1]) +
        padLeft(rate, widths[2]) +
        padLeft(amount, widths[3])
    );

    // Print remaining lines of wrapped item description
    for (let i = 1; i < nameLines.length; i++) {
        lines.push(
            padRight(nameLines[i], widths[0]) +
            "".padStart(widths[1] + widths[2] + widths[3], " ")
        );
    }

    // Print variant info on a new indented line if present
    if (variantInfo) {
        const variantLines = wrapText(` (${variantInfo})`, widths[0]);
        for (let vl of variantLines) {
            lines.push(
                padRight(vl, widths[0]) +
                "".padStart(widths[1] + widths[2] + widths[3], " ")
            );
        }
    }

    return lines.join("\n");
};

// --- Raw Text Receipt Generator ---
export const generateDosReceiptText = (printData, columnsCount = 40) => {
    const {
        docId = "N/A",
        date = new Date(),
        branchData = {},
        customerData = {},
        items = [],
        payments = { cash: 0, upi: 0, card: 0 },
        summary = { subtotal: 0, tax: 0, discount: 0, total: 0, received: 0, balance: 0 },
        returnReferences = []
    } = printData;

    const singleLine = "-".repeat(columnsCount);
    const doubleLine = "=".repeat(columnsCount);

    // Calculate dynamic widths for items table
    // 80mm standard (40 columns): Item(18) Qty(5) Rate(8) Amount(9)
    // 58mm standard (32 columns): Item(12) Qty(4) Rate(8) Amount(8)
    const tableWidths = columnsCount === 40 ? [18, 5, 8, 9] : [12, 4, 8, 8];

    const lines = [];

    // 1. Header
    lines.push(padCenter(branchData?.branchName || "WALRUS GARMENTS", columnsCount));
    const addressStr = branchData?.address || "Address details not available";
    const addressLines = wrapText(addressStr, columnsCount - 4);
    addressLines.forEach(ln => lines.push(padCenter(ln.trim(), columnsCount)));
    
    const phoneVal = branchData?.phone || branchData?.contactMobile || branchData?.contactPersonNumber || "9159477722";
    lines.push(padCenter(`Ph No.: ${phoneVal}`, columnsCount));
    if (branchData?.gstNo) {
        lines.push(padCenter(`GSTIN: ${branchData.gstNo}`, columnsCount));
    }
    lines.push("");
    lines.push(padCenter("CASH SALE", columnsCount));
    lines.push(doubleLine);

    // 2. Transaction Details
    const customerName = (customerData?.name || "WALK-IN CUSTOMER").toUpperCase();
    lines.push(padRight(`Customer: ${customerName}`, columnsCount));
    if (customerData?.contactPersonNumber) {
        lines.push(padRight(`Mobile: ${customerData.contactPersonNumber}`, columnsCount));
    }
    lines.push(padRight(`Bill No : # ${docId}`, columnsCount));
    if (returnReferences && returnReferences.length > 0) {
        lines.push(padRight(`Against : ${returnReferences.join(", ")}`, columnsCount));
    }
    lines.push(padRight(`Date    : ${moment(date).format('DD/MM/YYYY hh:mm A')}`, columnsCount));
    lines.push(singleLine);

    // 3. Items Headers
    lines.push(
        padRight("Item", tableWidths[0]) +
        padLeft("Qty", tableWidths[1]) +
        padLeft("Rate", tableWidths[2]) +
        padLeft("Amount", tableWidths[3])
    );
    lines.push(singleLine);

    // 4. Items Rows
    let totalQty = 0;
    items.forEach((item) => {
        const name = item?.Item?.name || item?.itemName || "Item";
        
        // Build variant info (Size / Color)
        const size = item?.Size?.name || item?.sizeName || "";
        const color = item?.Color?.name || item?.colorName || "";
        const variantInfo = [size, color].filter(Boolean).join(" / ");
        
        const qtyVal = parseFloat(item.qty || 0);
        totalQty += qtyVal;

        const rateVal = parseFloat(item.price || item.rate || 0);
        const amountVal = qtyVal * rateVal;

        lines.push(
            formatItemRow(
                name,
                variantInfo,
                qtyVal.toString(),
                rateVal.toFixed(0),
                amountVal.toFixed(0),
                tableWidths
            )
        );
    });
    lines.push(singleLine);

    // 5. Summary & Totals
    lines.push(padRight(`Total Items : ${items.length} (Qty: ${totalQty})`, columnsCount));
    lines.push(padRight(`Subtotal    : ` + padLeft(summary.subtotal.toFixed(2), columnsCount - 14), columnsCount));
    
    if (summary.tax > 0) {
        const halfTax = (summary.tax / 2).toFixed(2);
        lines.push(padRight(`CGST        : ` + padLeft(halfTax, columnsCount - 14), columnsCount));
        lines.push(padRight(`SGST        : ` + padLeft(halfTax, columnsCount - 14), columnsCount));
    }

    if (summary.discount > 0) {
        lines.push(padRight(`Discount    : ` + padLeft(`-${summary.discount.toFixed(2)}`, columnsCount - 14), columnsCount));
    }
    
    lines.push(singleLine);
    lines.push(padRight(`GRAND TOTAL : ` + padLeft(`Rs. ${summary.total.toFixed(0)}`, columnsCount - 14), columnsCount));
    lines.push(doubleLine);

    // 6. Payment breakdown
    let hasPayments = false;
    const paymentLines = [];
    paymentLines.push(padCenter("PAYMENT BREAKDOWN", columnsCount));
    if (payments.cash > 0) {
        paymentLines.push(padRight(`  Cash Paid : ` + padLeft(payments.cash.toFixed(2), columnsCount - 14), columnsCount));
        hasPayments = true;
    }
    if (payments.upi > 0) {
        paymentLines.push(padRight(`  UPI/GPay  : ` + padLeft(payments.upi.toFixed(2), columnsCount - 14), columnsCount));
        hasPayments = true;
    }
    if (payments.card > 0) {
        paymentLines.push(padRight(`  Card Paid : ` + padLeft(payments.card.toFixed(2), columnsCount - 14), columnsCount));
        hasPayments = true;
    }
    if (hasPayments) {
        lines.push(...paymentLines);
        lines.push(singleLine);
    }

    // 7. Footer
    lines.push(padCenter("THANK YOU!", columnsCount));
    lines.push(padCenter("Visit Again", columnsCount));
    lines.push("");
    
    const terms = wrapText("Product returns only valid within 7 days with original tag.", columnsCount);
    terms.forEach(t => lines.push(padCenter(t, columnsCount)));
    
    lines.push("");
    lines.push(padCenter("Printed via Walrus ERP POS System", columnsCount));

    return lines.join("\n");
};

// --- Standalone React Component ---
export default function POsDosPrinter({ printData, onClose }) {
    const [columns, setColumns] = useState(40); // Standard 40 column width

    // Dummy Print Data in case component is opened standalone/without parameters
    const activeData = useMemo(() => {
        if (printData) return printData;

        return {
            docId: "DOS-MOCK-777",
            date: new Date(),
            branchData: {
                branchName: "WALRUS BOUTIQUE",
                address: "No. 45, Khadarpet, Tiruppur, TN - 641601",
                phone: "9876543210",
                gstNo: "33AAAAA1111A1Z1"
            },
            customerData: {
                name: "John Doe",
                contactPersonNumber: "9988776655"
            },
            items: [
                {
                    itemName: "Cotton Boxer Shorts Premium Fit",
                    sizeName: "XL",
                    colorName: "Navy Blue",
                    qty: 2,
                    price: 249.00
                },
                {
                    itemName: "Invisible No-Show Cushioned Socks",
                    sizeName: "Standard",
                    colorName: "White",
                    qty: 3,
                    price: 99.00
                }
            ],
            payments: {
                cash: 500,
                upi: 295,
                card: 0
            },
            summary: {
                subtotal: 757.14,
                tax: 37.86,
                discount: 0.00,
                total: 795.00
            }
        };
    }, [printData]);

    const receiptText = useMemo(() => {
        return generateDosReceiptText(activeData, columns);
    }, [activeData, columns]);

    const triggerDosPrint = () => {
        const copies = activeData.printCopies || 1;
        const text = generateDosReceiptText(activeData, columns);

        const receiptBlocks = [];
        for (let i = 0; i < copies; i++) {
            const isLast = i === copies - 1;
            receiptBlocks.push(
                `<pre class="${isLast ? '' : 'page-break'}">${text}</pre>`
            );
        }

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <html>
            <head>
                <title>DOS_PRINT_RECEIPT_${activeData.docId}</title>
                <style>
                    @media print {
                        body { margin: 0; padding: 0; }
                        @page { 
                            size: ${columns === 40 ? '80mm' : '58mm'} auto; 
                            margin: 0; 
                        }
                        .page-break {
                            page-break-after: always;
                            break-after: page;
                        }
                    }
                    pre {
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 11px;
                        line-height: 1.1;
                        white-space: pre;
                        margin: 0;
                        padding: 8px;
                    }
                </style>
            </head>
            <body>
                ${receiptBlocks.join('\n')}
            </body>
            </html>
        `);
        doc.close();

        iframe.contentWindow.onload = () => {
            iframe.contentWindow.print();
        };

        const handleAfterPrint = () => {
            iframe.contentWindow.removeEventListener('afterprint', handleAfterPrint);
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 300);
        };

        iframe.contentWindow.addEventListener('afterprint', handleAfterPrint);
    };

    return (
        <div className="flex flex-col w-full h-[85vh] bg-[#525659] border border-slate-700/20 rounded overflow-hidden shadow-inner transition-all">
            {/* Top dark toolbar mimicking Chrome PDF viewer */}
            <div className="flex items-center justify-between bg-[#323639] text-white px-4 h-12 select-none shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black tracking-widest uppercase text-slate-300">DOS Print Preview</span>
                    <span className="text-[9px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-bold uppercase tracking-wider">
                        {columns === 40 ? '80mm' : '58mm'}
                    </span>
                </div>
                
                {/* Center columns/width selector */}
                <div className="flex items-center gap-1 bg-[#202124] p-0.5 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setColumns(40)}
                        className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-md transition-all ${
                            columns === 40
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                        title="80mm Paper (40 Columns)"
                    >
                        80mm
                    </button>
                    <button
                        onClick={() => setColumns(32)}
                        className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-md transition-all ${
                            columns === 32
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                        title="58mm Paper (32 Columns)"
                    >
                        58mm
                    </button>
                </div>

                {/* Right toolbar controls */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={triggerDosPrint} 
                        className="p-2 bg-[#202124] hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
                        title="Print Monospace Receipt"
                    >
                        <Printer size={15} />
                    </button>
                </div>
            </div>

            {/* Receipt container with grey background and centered white page */}
            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-[#525659] shadow-inner">
                <div 
                    className={`bg-white text-black shadow-2xl p-6 h-fit min-h-full border border-slate-400/30 transition-all duration-300 ${
                        columns === 40 ? 'w-[300px]' : 'w-[240px]'
                    }`}
                >
                    <pre className="font-mono text-[10px] leading-tight whitespace-pre select-text text-black bg-white">
                        {receiptText}
                    </pre>
                </div>
            </div>
        </div>
    );
}

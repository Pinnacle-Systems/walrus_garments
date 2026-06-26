import React from 'react';
import { X, Printer } from 'lucide-react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import PosMultiCopyPrint from '../PosMultiCopyPrint';
import PosDeliveryReceiptPrint from '../PosDeliveryReceiptPrint';
import printJS from 'print-js';

const ReceiptViewerModal = ({
    printData,
    setPrintData,
    Swal
}) => {
    if (!printData) return null;

    const PrintComponent = printData.isDeliveryReceipt ? PosDeliveryReceiptPrint : PosMultiCopyPrint;

    const handleDirectPrint = async () => {
        try {
            const totalCopies = printData.printCopies || 2;
            const needsSummarySlip = printData.showSummarySlip;

            // Generate blob for the BillPage (1 copy, no summary slip)
            const billPrintData = { ...printData, printCopies: 1, showSummarySlip: false };
            const billBlob = await pdf(<PrintComponent {...billPrintData} />).toBlob();
            const billBlobURL = URL.createObjectURL(billBlob);

            // Generate blob for the SummarySlip (0 bill copies, yes summary slip)
            let summaryBlobURL = null;
            if (needsSummarySlip) {
                const summaryPrintData = { ...printData, printCopies: 0, showSummarySlip: true };
                const summaryBlob = await pdf(<PrintComponent {...summaryPrintData} />).toBlob();
                summaryBlobURL = URL.createObjectURL(summaryBlob);
            }

            let currentCopy = 1;

            const printSummarySlip = () => {
                if (summaryBlobURL) {
                    printJS({
                        printable: summaryBlobURL,
                        type: 'pdf',
                        onPrintDialogClose: () => {
                            URL.revokeObjectURL(summaryBlobURL);
                        }
                    });
                }
            };

            const printNextBillCopy = () => {
                printJS({
                    printable: billBlobURL,
                    type: 'pdf',
                    onPrintDialogClose: () => {
                        if (currentCopy < totalCopies) {
                            currentCopy++;
                            setTimeout(printNextBillCopy, 500);
                        } else {
                            URL.revokeObjectURL(billBlobURL);
                            if (needsSummarySlip) {
                                setTimeout(printSummarySlip, 500);
                            }
                        }
                    }
                });
            };

            if (totalCopies > 0) {
                printNextBillCopy();
            } else if (needsSummarySlip) {
                printSummarySlip();
            }
        } catch (error) {
            console.error('Direct Print Failed:', error);
            Swal.fire({ title: "Print Error", text: error.message || "Failed to print.", icon: "error" });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Print Terminal</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{printData.docId} | {new Date().toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => setPrintData(null)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"><X size={20} /></button>
                </div>
                <div className="flex-1 bg-slate-100 p-4 sm:p-8 flex items-center justify-center overflow-hidden">
                    <div className="w-[300px] h-full shadow-2xl rounded-sm overflow-hidden border border-slate-200">
                        <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
                            <PrintComponent {...printData} />
                        </PDFViewer>
                    </div>
                </div>
                <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-4">
                    <button onClick={() => setPrintData(null)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Close Viewer</button>
                    <button
                        onClick={handleDirectPrint}
                        className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                        <Printer size={16} />
                        Send to Thermal Printer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptViewerModal;


import React from 'react';
import { X, Printer } from 'lucide-react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import PosMultiCopyPrint from '../PosMultiCopyPrint';
import PosDeliveryReceiptPrint from '../PosDeliveryReceiptPrint';
import printJS from 'print-js';
import { printReceiptInstructions, mapLocalPrintAgentError } from '../../../../Utils/localPrintAgent';
import { buildReceiptInstructions } from '../../../../printing/build-receipt-instructions';

const ReceiptViewerModal = ({
    printData,
    setPrintData,
    Swal
}) => {
    if (!printData) return null;

    const isSummarySlip = !!printData.isDeliveryReceipt;
    const PrintComponent = isSummarySlip ? PosDeliveryReceiptPrint : PosMultiCopyPrint;
    // Force 1 copy for the delivery/summary slip, otherwise use the invoice's printCopies.
    const copiesToPrint = isSummarySlip ? 1 : (printData?.printCopies || 1);

    const printViaBrowserFallback = async () => {
        // Generate PDF with only 1 page
        const blob = await pdf(<PrintComponent {...printData} />).toBlob();
        const blobURL = URL.createObjectURL(blob);

        // Loop to send multiple separate print jobs
        for (let i = 0; i < copiesToPrint; i++) {
            printJS({
                printable: blobURL,
                type: 'pdf',
                onPrintDialogClose: () => {
                    // Only revoke the URL after the very last copy finishes
                    if (i === copiesToPrint - 1) {
                        URL.revokeObjectURL(blobURL);
                    }
                }
            });

            // Add a small 1.5 second delay between prints to allow the printer to process and cut
            if (i < copiesToPrint - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
    };

    // This is the single "print" action for the popup: try the Local Print Agent
    // first, and only fall back to the browser PDF print path if it fails/unavailable.
    // The actual print job only fires when the user clicks this button — opening the
    // preview never prints by itself.
    const handleDirectPrint = async () => {
        try {
            const instructions = buildReceiptInstructions(printData, {
                variant: isSummarySlip ? 'summarySlip' : 'full',
                openCashDrawer: false
            });

            const printResult = await printReceiptInstructions({
                jobId: printData.docId,
                copies: copiesToPrint,
                instructions
            });

            if (!printResult.ok) {
                throw printResult;
            }

            Swal.fire({ title: 'Sent to Local Print Agent', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (localPrintError) {
            try {
                await printViaBrowserFallback();
                Swal.fire({
                    title: 'Browser print fallback opened.',
                    text: mapLocalPrintAgentError(localPrintError),
                    icon: 'warning',
                    timer: 3000,
                    showConfirmButton: false
                });
            } catch (fallbackError) {
                console.error('Direct Print Failed:', fallbackError);
                Swal.fire({ title: "Print Error", text: fallbackError.message || "Failed to print.", icon: "error" });
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl w-full max-w-[340px] h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider">{printData.docId}</p>
                    <button onClick={() => setPrintData(null)} className="p-1 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
                        <PrintComponent {...printData} />
                    </PDFViewer>
                </div>
                <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
                    <button onClick={() => setPrintData(null)} className="flex-1 py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Close</button>
                    <button
                        onClick={handleDirectPrint}
                        className="flex-[2] py-2.5 bg-indigo-600 text-white rounded-lg text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
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

import React from 'react';
import { X } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import PosThermalPrint from '../PosThermalPrint';

const ReceiptViewerModal = ({
    printData,
    setPrintData,
    Swal
}) => {
    if (!printData) return null;

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
                            <PosThermalPrint {...printData} />
                        </PDFViewer>
                    </div>
                </div>
                <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-4">
                    <button onClick={() => setPrintData(null)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Close Viewer</button>
                    <button
                        onClick={() => {
                            Swal.fire({ title: "Info", text: "Use the Print icon inside the terminal viewer.", icon: "info", timer: 1500, showConfirmButton: false });
                        }}
                        className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 block text-center"
                    >
                        Send to Thermal Printer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptViewerModal;

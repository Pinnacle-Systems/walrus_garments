import React from 'react';
import { ReusableInput } from "../Order/CommonInput";

const CommonFormFooter = ({ 
    remarks, 
    setRemarks, 
    terms, 
    setTerms, 
    totalQty, 
    subtotal, 
    taxAmount, 
    netAmount 
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 border-t border-slate-200 pt-4 mb-2">
            {/* First Div: Remarks */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Remarks</label>
                <textarea
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none min-h-[100px] shadow-sm bg-white"
                    placeholder="Enter process remarks..."
                    value={remarks || ''}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            {/* Second Div: Terms and Conditions */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Terms & Conditions</label>
                <textarea
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none min-h-[100px] shadow-sm bg-white"
                    placeholder="Enter terms and conditions..."
                    value={terms || ''}
                    onChange={(e) => setTerms(e.target.value)}
                />
            </div>

            {/* Third Div: Totals */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Total Quantity</span>
                    <span className="text-slate-800 font-bold">{totalQty || 0}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="text-slate-800 font-bold">₹{(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">GST Amount</span>
                    <span className="text-slate-800 font-bold">₹{(taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-slate-800 font-black text-lg">Net Amount</span>
                    <span className="text-indigo-600 font-black text-xl">₹{(netAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>
    );
};

export default CommonFormFooter;

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Modal from '../../../../UiComponents/Modal';
import { useUpdatePosPaymentsMutation } from '../../../../redux/uniformService/PointOfSalesService';

const PaymentUpdateModal = ({ isOpen, onClose, dataObj }) => {
    const [updatePosPayments, { isLoading }] = useUpdatePosPaymentsMutation();
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        if (isOpen && dataObj) {
            const predefinedModes = [
                { mode: 'Cash', label: 'Cash' },
                { mode: 'UPI', label: 'G Pay' },
                { mode: 'Card', label: 'Card' },
                { mode: 'Online', label: 'Online / Banking' },
            ];

            const initialPayments = predefinedModes.map(pm => {
                const existing = (dataObj.PosPayments || []).find(p => p.paymentMode === pm.mode);
                return {
                    id: existing?.id,
                    paymentMode: pm.mode,
                    paymentLabel: pm.label,
                    amount: existing?.amount ? parseFloat(existing.amount) : '',
                    reference_no: existing?.reference_no || '',
                    transaction_id: existing?.transaction_id || ''
                };
            });
            
            setPayments(initialPayments);
        }
    }, [isOpen, dataObj]);

    const billAmount = parseFloat(dataObj?.netAmount || 0);
    const newTotal = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const isValid = Math.abs(billAmount - newTotal) < 0.1;

    const handleChange = (index, field, value) => {
        const newPayments = [...payments];
        newPayments[index][field] = value;
        setPayments(newPayments);
    };

    const handleSave = async () => {
        if (!isValid) return;

        try {
            const validPayments = payments.filter(p => parseFloat(p.amount) > 0);
            const res = await updatePosPayments({
                id: dataObj.id,
                payments: validPayments
            }).unwrap();

            if (res.statusCode === 0) {
                Swal.fire({ title: 'Success', text: 'Payments updated successfully!', icon: 'success', timer: 1500, showConfirmButton: false });
                onClose(true); // pass true to indicate success/refresh
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to update payments', 'error');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => onClose(false)} title={`Update Payments (Bill: ${dataObj?.docId})`} size="lg">
            <div className="p-4 bg-gray-50 rounded-b-lg">
                <div className="flex justify-between items-center mb-4 bg-white p-3 border rounded shadow-sm">
                    <div className="text-gray-700 font-bold">Total Bill Amount:</div>
                    <div className="text-xl font-black text-gray-800">₹ {billAmount.toFixed(2)}</div>
                </div>

                <div className="overflow-x-auto bg-white rounded border shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                            <tr>
                                <th className="px-3 py-2">Payment Mode</th>
                                <th className="px-3 py-2 text-right">Amount (₹)</th>
                                <th className="px-3 py-2">Reference No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-semibold text-gray-700">
                                        {p.paymentLabel}
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-right font-semibold text-blue-700"
                                            value={p.amount}
                                            onChange={(e) => handleChange(idx, 'amount', e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            value={p.reference_no}
                                            onChange={(e) => handleChange(idx, 'reference_no', e.target.value)}
                                            placeholder="Ref (optional)"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-3 bg-gray-50 border-t flex justify-end items-center">
                        <div className="font-bold text-gray-700 text-sm text-right">
                            Total Entered: <span className={Math.abs(billAmount - newTotal) > 0.1 ? 'text-red-600' : 'text-green-600'}>₹ {newTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {!isValid && (
                    <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Validation Error: The total payments (₹ {newTotal.toFixed(2)}) must exactly match the bill amount (₹ {billAmount.toFixed(2)}).
                    </div>
                )}

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 transition"
                        onClick={() => onClose(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className={`px-4 py-2 rounded text-white shadow transition flex items-center gap-2 ${isValid && !isLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                        disabled={!isValid || isLoading}
                        onClick={handleSave}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        Save Payments
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentUpdateModal;

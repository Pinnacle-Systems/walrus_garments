import React from 'react';
import { Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PosReports = ({ showReports, setShowReports, recentSales }) => {
    return (
        <AnimatePresence>
            {showReports && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={16} className="text-indigo-600" /> Recent POS Sales
                            </h2>
                            <button onClick={() => setShowReports(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors shadow-sm"><X size={16} /></button>
                        </div>
                        <div className="p-4 overflow-auto bg-[#f8fafc]/50 flex-1">
                            <table className="w-full text-left text-sm border-separate border-spacing-0">
                                <thead className="bg-white sticky top-0 shadow-sm z-10">
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-4 py-3 border-b border-slate-200">Invoice #</th>
                                        <th className="px-4 py-3 border-b border-slate-200">Date/Time</th>
                                        <th className="px-4 py-3 border-b border-slate-200">Customer</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-center">Items</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-right">Method</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-right">Total (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSales.map((sale, idx) => (
                                        <tr key={sale.id || idx} className="hover:bg-indigo-50/40 transition-colors group">
                                            <td className="px-4 py-3 border-b border-slate-100 font-mono text-xs font-bold text-indigo-600">{sale.docId || 'N/A'}</td>
                                            <td className="px-4 py-3 border-b border-slate-100 text-xs font-bold text-slate-500">{sale.date ? new Date(sale.date).toLocaleString() : 'N/A'}</td>
                                            <td className="px-4 py-3 border-b border-slate-100 text-[11px] font-black uppercase text-slate-700">{sale.Party?.name || 'Walk-in'}</td>
                                            <td className="px-4 py-3 border-b border-slate-100 text-center text-xs font-bold text-slate-500">{sale.PosItems?.length || 0}</td>
                                            <td className="px-4 py-3 border-b border-slate-100 text-right text-[10px] font-black uppercase text-slate-400">{sale.paymentMethod || 'CASH'}</td>
                                            <td className="px-4 py-3 border-b border-slate-100 text-right font-black text-slate-800">
                                                {(sale.PosItems || []).reduce((acc, item) => acc + (parseFloat(item.price || 0) * parseFloat(item.qty || 0)), 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentSales.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-xs font-bold text-slate-400">No POS reports found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PosReports;

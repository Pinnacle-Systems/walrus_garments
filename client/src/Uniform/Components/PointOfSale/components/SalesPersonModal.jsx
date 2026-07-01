import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanBarcode, Search, ChevronRight, Zap } from 'lucide-react';
import Modal from '../../../../UiComponents/Modal';

const SalesPersonModal = ({
    isOpen,
    onClose,
    salesPersonScannerRef,
    salesPersonBarcode,
    setSalesPersonBarcode,
    handleSalesPersonScan,
    employees
}) => {
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const containerRef = React.useRef(null);

    const EMPTY_ARRAY = React.useMemo(() => [], []);

    const filteredEmployees = React.useMemo(() => {
        if (salesPersonBarcode.length < 1) return EMPTY_ARRAY;
        return employees.filter(emp =>
            emp.active &&
            (emp.name?.toLowerCase().includes(salesPersonBarcode.toLowerCase()) ||
                emp.employeeId?.toLowerCase().includes(salesPersonBarcode.toLowerCase()))
        );
    }, [employees, salesPersonBarcode, EMPTY_ARRAY]);

    React.useEffect(() => {
        setActiveIndex(filteredEmployees.length > 0 ? 0 : -1);
    }, [filteredEmployees]);

    React.useEffect(() => {
        if (activeIndex >= 0 && containerRef.current) {
            const activeEl = containerRef.current.children[activeIndex];
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeIndex]);

    const handleKeyDown = (e) => {

        if (filteredEmployees.length == 0) return

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % filteredEmployees.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + filteredEmployees.length) % filteredEmployees.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < filteredEmployees.length) {
                handleSalesPersonScan(filteredEmployees[activeIndex].employeeId);
            } else {
                handleSalesPersonScan(salesPersonBarcode);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    /* console.log removed */

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            widthClass="w-[400px] rounded-2xl p-0 overflow-hidden shadow-2xl"
        >
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <ScanBarcode size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Sales Person</h2>
                        <p className="text-indigo-100 text-xs font-bold mt-0.5">Please scan salesperson barcode</p>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-white">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        ref={salesPersonScannerRef}
                        autoFocus
                        type="text"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-lg font-black tracking-widest placeholder:text-slate-300 uppercase"
                        placeholder="SCAN OR TYPE ID..."
                        value={salesPersonBarcode}
                        onChange={(e) => setSalesPersonBarcode(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Employee Suggestions Selection */}{console.log(filteredEmployees, "filteredEmployees")}
                <AnimatePresence>
                    {salesPersonBarcode.length >= 1 && (
                        <motion.div
                            ref={containerRef}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 max-h-[240px] overflow-auto border-2 border-slate-50 rounded-2xl divide-y divide-slate-50 shadow-inner bg-slate-50/30"
                        >
                            {filteredEmployees.map((emp, idx) => {
                                const isHighlighted = idx === activeIndex;
                                return (
                                    <button
                                        key={emp.id}
                                        onClick={() => handleSalesPersonScan(emp.employeeId)}
                                        className={`w-full p-4 text-left transition-all flex items-center justify-between group ${isHighlighted ? 'bg-indigo-50 font-bold' : 'hover:bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px] uppercase">
                                                {emp.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{emp.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{emp.employeeId}</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-all transform group-hover:translate-x-1" />
                                    </button>
                                );
                            })}
                            {employees.filter(emp =>
                                emp.name?.toLowerCase().includes(salesPersonBarcode.toLowerCase()) ||
                                emp.employeeId?.toLowerCase().includes(salesPersonBarcode.toLowerCase()) ||
                                emp.regNo?.toLowerCase().includes(salesPersonBarcode.toLowerCase())
                            ).length === 0 && (
                                    <div className="p-6 text-center text-slate-400">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No matching employee found</p>
                                    </div>
                                )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* <div className="mt-6 flex flex-col gap-3">
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                        <Zap size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                            scanning the salesperson barcode will link this staff member to the currently scanned item for commission tracking.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                        Skip for now
                    </button>
                </div> */}
            </div>
        </Modal>
    );
};

export default SalesPersonModal;

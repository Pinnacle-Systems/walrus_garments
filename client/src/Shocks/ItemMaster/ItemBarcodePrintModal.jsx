import React, { useState, useMemo } from "react";
import { Search, Printer, X, Plus, Minus, FileText } from "lucide-react";
import Modal from "../../UiComponents/Modal";
import BarCodePrintFormat from "../../Uniform/Components/PurchaseInward/BarcodePrintFormat";
import { findFromList } from "../../Utils/helper";
import { useGetSizeMasterQuery } from "../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../redux/uniformService/ColorMasterService";

/**
 * ItemBarcodePrintModal
 * 
 * A user-friendly modal to select variant-wise barcodes and specify quantities for printing.
 */
export default function ItemBarcodePrintModal({ isOpen, onClose, item, sizeData, colorData }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [printQuantities, setPrintQuantities] = useState({}); // { barcode: qty }
    const [showPreview, setShowPreview] = useState(false);

    // Prepare a flat list of all barcodes with variant info for the table
    const variantBarcodes = useMemo(() => {
        if (!item?.ItemPriceList) return [];

        return item.ItemPriceList.flatMap(priceRow => {
            const sizeName = findFromList(priceRow.sizeId, sizeData?.data, "name") || "Standard";
            const colorName = findFromList(priceRow.colorId, colorData?.data, "name");
            const variantLabel = colorName ? `${sizeName} / ${colorName}` : sizeName;

            return (priceRow.ItemBarcodes || []).map(bc => ({
                ...bc,
                variantLabel,
                sizeId: priceRow.sizeId,
                colorId: priceRow.colorId,
                salesPrice: priceRow.salesPrice,
                priceRowId: priceRow.id
            }));
        });
    }, [item, sizeData, colorData]);

    // Filter based on search term
    const filteredBarcodes = variantBarcodes.filter(bc => 
        bc.variantLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bc.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleQtyChange = (barcode, val) => {
        const qty = Math.max(0, parseInt(val) || 0);
        setPrintQuantities(prev => ({ ...prev, [barcode]: qty }));
    };

    const handleQuickAction = (action) => {
        const newQtys = { ...printQuantities };
        if (action === "setAll1") {
            variantBarcodes.forEach(bc => { newQtys[bc.barcode] = 1; });
        } else if (action === "clear") {
            variantBarcodes.forEach(bc => { newQtys[bc.barcode] = 0; });
        }
        setPrintQuantities(newQtys);
    };

    const totalLabels = Object.values(printQuantities).reduce((a, b) => a + b, 0);

    // Prepare data for BarCodePrintFormat
    // format: data = [{ itemId, sizeId, colorId, qty }]
    const printData = useMemo(() => {
        return variantBarcodes
            .filter(bc => printQuantities[bc.barcode] > 0)
            .map(bc => ({
                itemId: item.id,
                sizeId: bc.sizeId,
                colorId: bc.colorId,
                qty: printQuantities[bc.barcode],
                barcode: bc.barcode // We pass barcode explicitly to ensure the right one is used
            }));
    }, [variantBarcodes, printQuantities, item]);

    if (showPreview) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={() => setShowPreview(false)}
                widthClass="w-[90%] h-[90%]"
                title={`Barcode Preview - ${item?.name}`}
            >
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center p-3 border-b bg-gray-50">
                        <p className="text-sm text-gray-600">Total Labels to Print: <span className="font-bold text-indigo-600">{totalLabels}</span></p>
                        <button 
                            onClick={() => setShowPreview(false)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-xs font-medium transition-colors"
                        >
                            <X size={14} /> Back to Selection
                        </button>
                    </div>
                    <div className="flex-1 min-h-0">
                        <BarCodePrintFormat 
                            data={printData}
                            sizeList={sizeData}
                            itemList={{ data: [item] }}
                            itemPriceList={{ data: item?.ItemPriceList }}
                        />
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            widthClass="w-[800px] h-[80%]"
            title={`Print Barcodes - ${item?.name}`}
        >
            <div className="flex flex-col h-full bg-gray-50">
                {/* Header Actions */}
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Search variant or barcode..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleQuickAction("setAll1")}
                            className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors border border-indigo-100"
                        >
                            Set All to 1
                        </button>
                        <button 
                            onClick={() => handleQuickAction("clear")}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-gray-200"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Variant (Size/Color)</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Barcode</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-40">Print Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBarcodes.length > 0 ? (
                                    filteredBarcodes.map((bc, idx) => (
                                        <tr key={`${bc.barcode}-${idx}`} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-800">{bc.variantLabel}</div>
                                                <div className="text-[10px] text-gray-400">Price: ₹{bc.salesPrice}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{bc.barcode}</code>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    bc.barcodeType === 'REGULAR' 
                                                        ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                }`}>
                                                    {bc.barcodeType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button 
                                                        onClick={() => handleQtyChange(bc.barcode, (printQuantities[bc.barcode] || 0) - 1)}
                                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <input 
                                                        type="number"
                                                        className="w-16 text-center border-b border-gray-200 focus:border-indigo-500 focus:outline-none text-sm font-semibold bg-transparent"
                                                        value={printQuantities[bc.barcode] || 0}
                                                        onChange={(e) => handleQtyChange(bc.barcode, e.target.value)}
                                                        onFocus={(e) => e.target.select()}
                                                    />
                                                    <button 
                                                        onClick={() => handleQtyChange(bc.barcode, (printQuantities[bc.barcode] || 0) + 1)}
                                                        className="p-1 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-md transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-10 text-center text-gray-400 text-sm italic">
                                            No variants found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-white flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                            <span className="text-xs text-gray-500 block leading-tight">Total Labels Selected</span>
                            <span className="text-xl font-bold text-indigo-600">{totalLabels}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            disabled={totalLabels === 0}
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-2 px-8 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-indigo-100 transition-all transform active:scale-95"
                        >
                            <Printer size={16} /> Preview & Print
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

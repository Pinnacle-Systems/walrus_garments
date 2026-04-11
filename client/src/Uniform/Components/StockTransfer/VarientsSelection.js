import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import Swal from 'sweetalert2';

const VarientsSelection = ({ matches = [], onConfirm, onClose, stockDrivenFields = [], title = "Select Variants" }) => {
    const [searchFilters, setSearchFilters] = useState({});
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [dataPerPage] = useState(10);

    useEffect(() => {
        setSelectedIndices([]);
    }, [matches]);

    // Filter logic
    const filteredMatches = matches.filter(match => {
        return Object.keys(searchFilters).every(key => {
            if (!searchFilters[key]) return true;
            return String(match[key] || "").toLowerCase().includes(searchFilters[key].toLowerCase());
        });
    });

    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    };

    const handleSearchChange = (key, value) => {
        setSearchFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPageNumber(1); // Reset to first page on search
    };

    const handleToggle = (originalMatch) => {
        const index = matches.indexOf(originalMatch);
        setSelectedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleSelectAllChange = (checked) => {
        if (checked) {
            setSelectedIndices(filteredMatches.map(m => matches.indexOf(m)));
        } else {
            setSelectedIndices([]);
        }
    };

    const isItemSelected = (match) => {
        return selectedIndices.includes(matches.indexOf(match));
    };

    const getSelectAll = () => {
        return filteredMatches.length > 0 && filteredMatches.every(m => isItemSelected(m));
    };

    const handleDoneSelection = () => {
        if (selectedIndices.length === 0) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Please select at least one item",
            });
            return;
        }
        onConfirm(selectedIndices.map(i => matches[i]));
    };

    // Pagination logic
    const indexOfLastItem = currentPageNumber * dataPerPage;
    const indexOfFirstItem = indexOfLastItem - dataPerPage;
    const currentItems = filteredMatches.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className='border border-gray-200 shadow-sm bg-[#f1f1f0] h-full flex flex-col'>
            <div className="flex-grow overflow-hidden flex flex-col">
                {/* Header Section - Matches YarnInwardItemSelection */}
                <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-2 mb-2 rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                            {title}
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleDoneSelection}
                            className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                     border border-green-600 flex items-center gap-1 text-xs font-medium transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>

                {/* Table Section - Matches YarnInwardItemSelection */}
                <div className="flex-grow overflow-auto mx-3 bg-white mb-3 shadow-sm border border-gray-200 rounded-b-lg">
                    <table className="border-collapse w-full table-fixed">
                        <thead className="bg-gray-200 text-gray-800 sticky top-0 z-20">
                            <tr>
                                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-7">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => handleSelectAllChange(e.target.checked)}
                                        checked={getSelectAll()}
                                    />
                                </th>
                                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-8">S No</th>
                                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-64">
                                    <label className="block mb-1">Item</label>
                                    {/* <input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg px-2 text-[11px]"
                                        placeholder="Search"
                                        value={searchFilters.item_name || ""}
                                        onChange={(e) => handleSearchChange('item_name', e.target.value)}
                                    /> */}
                                </th>
                                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-20 text-gray-800">
                                    <label className="block mb-1">Size</label>
                                    {/* <input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg px-2 text-[11px]"
                                        placeholder="Search"
                                        value={searchFilters.size || ""}
                                        onChange={(e) => handleSearchChange('size', e.target.value)}
                                    /> */}
                                </th>
                                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-32">
                                    <label className="block mb-1 text-gray-800">Color</label>
                                    {/* <input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg px-2 text-[11px]"
                                        placeholder="Search"
                                        value={searchFilters.color || ""}
                                        onChange={(e) => handleSearchChange('color', e.target.value)}
                                    /> */}
                                </th>
                                {stockDrivenFields.map(field => (
                                    <th key={field.key} className="px-1 py-1.5 border border-gray-300 text-center text-xs w-32">
                                        <label className="block mb-1">{field.label}</label>
                                        {/* <input
                                            type="text"
                                            className="text-black h-6 focus:outline-none border w-full border-gray-400 rounded-lg px-2 text-[11px]"
                                            placeholder="Search"
                                            value={searchFilters[field.key] || ""}
                                            onChange={(e) => handleSearchChange(field.key, e.target.value)}
                                        /> */}
                                    </th>
                                ))}
                                <th className="px-1 py-1.5 border border-gray-300 text-xs w-24 text-center">
                                    <label className="block mb-1">Available Stock</label>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6 + stockDrivenFields.length} className="px-4 py-8 text-center text-gray-500">
                                        No matching variants found
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((item, index) => (
                                    <tr
                                        key={matches.indexOf(item)}
                                        className={`hover:bg-gray-50 py-1 transition-colors border-b border-gray-200 text-[12px] cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-100"} ${isItemSelected(item) ? "bg-blue-50" : ""}`}
                                        onClick={() => handleToggle(item)}
                                    >
                                        <td className='py-1 text-center' onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isItemSelected(item)}
                                                onChange={() => handleToggle(item)}
                                            />
                                        </td>
                                        <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="border border-gray-300 text-[11px] py-1.5 px-3 font-semibold text-gray-800">
                                            {item.item_name}
                                        </td>
                                        <td className="border border-gray-300 text-[11px] py-1.5 px-2 text-left text-gray-700">
                                            {item.size}
                                        </td>
                                        <td className="border border-gray-300 text-[11px] py-1.5 px-2 text-left text-gray-700 font-medium ">
                                            {item.color}
                                        </td>
                                        {stockDrivenFields.map(field => (
                                            <td key={field.key} className="border border-gray-300 text-[11px] py-1.5 px-2 text-center text-gray-600">
                                                {item[field.key]}
                                            </td>
                                        ))}
                                        <td className="border border-gray-300 text-[11px] text-right py-1.5 px-3 font-bold text-gray-900">
                                            {parseFloat(item.stockQty).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Segment - Matches YarnInwardItemSelection */}
            {/* <div className="bg-white border-t border-gray-200 py-3">
                <ReactPaginate
                    previousLabel={"<"}
                    nextLabel={">"}
                    breakLabel={"..."}
                    breakClassName={"break-me"}
                    forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
                    pageCount={Math.ceil(filteredMatches.length / dataPerPage)}
                    marginPagesDisplayed={1}
                    onPageChange={handleOnclick}
                    containerClassName={"flex justify-center m-2 gap-5 items-center"}
                    pageClassName={"border custom-circle text-center"}
                    disabledClassName={"p-1 bg-gray-200 opacity-50"}
                    previousLinkClassName={"border px-3 py-1 text-center hover:bg-gray-50 flex items-center justify-center rounded transition-colors"}
                    nextLinkClassName={"border px-3 py-1 text-center hover:bg-gray-50 flex items-center justify-center rounded transition-colors"}
                    activeClassName={"bg-blue-900 text-white px-2 rounded"}
                />
            </div> */}
        </div>
    );
};

export default VarientsSelection;

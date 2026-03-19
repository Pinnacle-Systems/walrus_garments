import React, { useEffect, useState } from "react";
import useOutsideClick from "../CustomHooks/handleOutsideClick";
import { useGetItemMasterByIdQuery, useGetItemMasterQuery } from "../redux/uniformService/ItemMasterService";
import secureLocalStorage from "react-secure-storage";
import { findFromList } from "./helper";

const ItemMasterSearch = ({
    setItemId,
    itemId,
    name = "Item",
    readOnly,
    required = false,
}) => {
    const [isListShow, setIsListShow] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);

    const inputRef = useOutsideClick(() => {
        setIsListShow(false);
    });

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    );
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "branchId"
    );

    const params = {
        companyId,
        branchId,
        itemName: search
    };

    const {
        data: itemData,
        isLoading,
    } = useGetItemMasterQuery({ params, });

    const { data: itemDataById } = useGetItemMasterByIdQuery(itemId, { skip: !itemId });

    useEffect(() => {
        if (itemData?.data) {
            setFilteredItems(itemData.data);
        }
    }, [itemData]);

    const displayValue = itemDataById?.data?.name || findFromList(itemId, itemData?.data || [], "name") || "";


    return (
        <div id="itemSearch" className="relative flex flex-col text-black z-10 w-full" ref={inputRef}>
            <div className="grid grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1 gap-1">
                <label className="text-xs font-bold text-gray-600">
                    {name} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="col-span-2 relative">
                    {readOnly ? (
                        <div className="w-full px-3 py-1 text-xs border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed h-7 flex items-center">
                            {displayValue}
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                className="w-full px-3 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white h-7"
                                value={isListShow ? search : displayValue}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setIsListShow(true)}
                                placeholder="Search Item..."
                                tabIndex={0}
                            />
                            {isListShow && (
                                <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto top-full left-0">
                                    {filteredItems.map((item) => (
                                        <li
                                            key={item.id}
                                            className="group px-3 py-2 text-xs hover:bg-indigo-600 hover:text-white cursor-pointer border-b border-gray-100 last:border-none transition-all flex flex-col gap-0.5"
                                            onClick={() => {
                                                setItemId(item.id);
                                                setIsListShow(false);
                                                setSearch("");
                                            }}
                                        >
                                            <span className="font-semibold text-gray-800 group-hover:text-white">{item.name}</span>
                                            <span className="text-[10px] text-gray-500 group-hover:text-indigo-100 italic">{item.code}</span>
                                        </li>
                                    ))}

                                    {filteredItems.length === 0 && !isLoading && (
                                        <li className="px-3 py-1.5 text-xs text-gray-500">No items found</li>
                                    )}
                                    {isLoading && (
                                        <li className="px-3 py-1.5 text-xs text-gray-500">Loading...</li>
                                    )}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemMasterSearch;

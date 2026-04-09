import React, { useEffect } from 'react';
import { useGetTaxTermMasterQuery } from '../../../redux/services/TaxTermMasterServices';
import { toast } from 'react-toastify';
import { Loader } from '..';
import { DELETE, PLUS } from '../../../icons';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const TaxTemplateGrid = ({ templateItems, setTemplateItems, readOnly, params, accessoryCategoryList, accessoryGroupList, accessoryList, id }) => {


    console.log(templateItems, "taxTemplat")

    function handleOnClick(index, value) {
        if (readOnly) return
        let newList = structuredClone(templateItems);
        newList[index]["additionalTax"] = value
        setTemplateItems(newList);
    }



    const [contextMenu, setContextMenu] = useState(null);
    const [contextSubGridMenu, setContextSubGridMenu] = useState(null);


    const handleRightClick = (event, rowIndex, type) => {
        console.log(rowIndex, "rowIndexs");

        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            type,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };


    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(templateItems);
        newBlend[index][field] = value;
        setTemplateItems(newBlend);
    };

    const addNewRow = () => {

        const newRow = { accessoryId: "", displayName: "", value: "", amount: "" };
        setTemplateItems([...templateItems, newRow]);
    };
    const handleDeleteRow = id => {
        setTemplateItems(tax => tax.filter((row, index) => index !== parseInt(id)));
    };

    
  const handleDeleteAllRows = () => {
    setTemplateItems((prevRows) => {
      if (prevRows.length <= 1) return prevRows;
      return [prevRows[0]];
    });
  };


    const { data: TaxTermList, isLoading, isFetching } =
        useGetTaxTermMasterQuery({ params: { ...params, active: true } });

    function findIdInTaxTerms(id) {
        return templateItems ? templateItems.find(taxItems => parseInt(taxItems.taxTermId) === parseInt(id)) : false
    }

    useEffect(() => {
        if (readOnly) return
        else {
            if (templateItems.length === 0) {
                setTemplateItems([
                    { accessoryId: "", displayName: "", value: "", amount: "" },
                    { accessoryId: "", displayName: "", value: "", amount: "" },
                    { accessoryId: "", displayName: "", value: "", amount: "" },
                    { accessoryId: "", displayName: "", value: "", amount: "" },
                ]);
            }
        }
    }, [templateItems])
    if (!TaxTermList || isLoading || isFetching) return <Loader />

    return (
        <>
            {/* {
                taxTemplateItems.length !== 0 ?
                    <>
                        <div className={`w-full overflow-y-auto p-3 `}>
                            <table className=" border border-gray-600 text-xs table-auto w-full">
                                <thead className='bg-gray-100 top-0'>
                                    <tr>
                                        <th className="tx-table-cell border border-gray-600 w-28">A Name</th>
                                        <th className="tx-table-cell border border-gray-600 w-32">Display Name</th>
                                        <th className="tx-table-cell border border-gray-600 ">Value</th>
                                        <th className="tx-table-cell border border-gray-600">Amount</th>
                                        <th className={` ${readOnly ? "hidden" : "w-5"}`}>
                                            {readOnly ?
                                                "" :
                                                <div onClick={addRow}
                                                    className='hover:cursor-pointer  py-2 flex items-center justify-center bg-green-600 text-white rounded'>
                                                    {PLUS}
                                                </div>
                                            }
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='overflow-y-auto border border-gray-600 h-full w-full'>
                                    {taxTemplateItems.map((row, index) => (
                                        <tr key={index} className="w-full">
                                            <td className='flex justify-center items-center'>
                                                <select disabled={readOnly}
                                                    className='text-left w-full rounded border border-gray-600 h-8 py-2 focus:outline-none'
                                                    value={row.taxTermId} onChange={(e) => handleInputChange(e, index, "taxTermId")}>
                                                    <option hidden>
                                                        Select
                                                    </option>
                                                    {TaxTermList.data.map((taxItems) =>
                                                        <option value={taxItems.id} key={taxItems.id} hidden={findIdInTaxTerms(taxItems.id)}>
                                                            {taxItems.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="border border-gray-600 text-center rounded h-8 py-2 w-full"
                                                    value={(row.displayName)}
                                                    disabled={readOnly}
                                                    onChange={(event) =>
                                                        handleInputChange(event, index, "displayName")
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="border border-gray-600 text-center rounded h-8 py-2 w-full"
                                                    value={(row.value)}
                                                    disabled={readOnly}
                                                    onChange={(event) =>
                                                        handleInputChange(event, index, "value")
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="border border-gray-600 text-center rounded h-8 py-2 w-full"
                                                    value={(row.amount)}
                                                    disabled={readOnly}
                                                    onChange={(event) =>
                                                        handleInputChange(event, index, "amount")
                                                    }
                                                />
                                            </td>
                                            <td className={`border border-gray-600 hover:cursor-pointer ${readOnly ? "hidden" : ""} `}>
                                                {readOnly
                                                    ?
                                                    ""
                                                    :
                                                    <div tabIndex={-1} onClick={() => handleDeleteRow(index)} className='flex justify-center px-2 py-2 items-center rounded bg-gray-300'>
                                                        {DELETE}
                                                    </div>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                    :
                    <div></div>
            } */}
            <div className={` relative w-full overflow-y-auto  py-1`}>
                <table className="w-full border-collapse table-fixed">
                    <thead className="bg-gray-200 text-gray-900">
                        <tr>
                            <th
                                className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                S.No
                            </th>
                            <th

                                className={`w-48 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Accessory Group
                            </th>
                            <th

                                className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Accessory Category
                            </th>
                            <th

                                className={`w-80 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Accessory Name
                            </th>

                            {/* <th

                                className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Color
                            </th>

                            <th

                                className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Size
                            </th>
                */}



                            <th

                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>

                        {templateItems?.map((row, index) => (
                            <tr key={index} className="border border-blue-gray-200 cursor-pointer"

                                onContextMenu={(e) => {
                                    if (!readOnly) {
                                        handleRightClick(e, index, "notes");
                                    }
                                }}
                            >
                                <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                                    {index + 1}
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryGroupId") } }}
                                        disabled={readOnly} className='text-left w-full rounded py-1 tx-table-input' value={row.accessoryGroupId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryGroupId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryGroupId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? (accessoryGroupList?.data || []) : accessoryGroupList?.data.filter(item => item.active) || []).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryCategoryId") } }}
                                        disabled={readOnly || !row.accessoryGroupId} className='text-left w-full rounded py-1 tx-table-input' value={row.accessoryCategoryId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryCategoryId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryCategoryId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? (accessoryCategoryList?.data || []) : accessoryCategoryList?.data?.filter(item => item.active) || []).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryId") } }}
                                        disabled={readOnly || !row.accessoryCategoryId} className='text-left w-full rounded py-1 tx-table-input' value={row.accessoryId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? (accessoryList?.data || []) : accessoryList?.data?.filter(item => item.active && item?.accessoryCategoryId == row?.accessoryCategoryId && item?.accessoryGroupId == row?.accessoryGroupId) || [])?.map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.aliasName}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                {/* <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                        disabled={readOnly || !row.accessoryId} className='text-left w-full rounded py-1 tx-table-input' value={row.colorId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "colorId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? colorList?.data : colorList?.data?.filter(item => item.active))?.map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                        disabled={readOnly || !row.accessoryId} className='text-left w-20 rounded py-1 tx-table-input' value={row.sizeId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "sizeId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? sizeList?.data : sizeList?.data?.filter(item => item.active))?.map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td> */}
                                {/* <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                        disabled={readOnly || !row.accessoryId} className='text-left w-20 rounded py-1 tx-table-input' value={row.uomId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "uomId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? uomList?.data : uomList?.data.filter(item => item.active))?.map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td> */}



                                <td
                                    className="w-10 border border-gray-300"

                                >
                                    <button
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addNewRow();
                                            }
                                        }}
                                        className="flex items-center justify-center w-full py-1"
                                    >
                                        <Plus size={18} className="text-red-800" />
                                    </button>
                                </td>


                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
            {contextMenu && (
                <div
                    style={{
                        position: "absolute",
                        top: `${contextMenu.mouseY - 50}px`,
                        left: `${contextMenu.mouseX - 30}px`,

                        // background: "gray",
                        boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                        padding: "8px",
                        borderRadius: "4px",
                        zIndex: 1000,
                    }}
                    className="bg-gray-100"
                    onMouseLeave={handleCloseContextMenu} // Close when the mouse leaves
                >
                    <div className="flex flex-col gap-1">
                        <button
                            className=" text-black text-[12px] text-left rounded px-1"
                            onClick={() => {
                                handleDeleteRow(contextMenu.rowId);
                                handleCloseContextMenu();
                            }}
                        >
                            Delete{" "}
                        </button>
                        <button
                            className=" text-black text-[12px] text-left rounded px-1"
                            onClick={() => {
                                handleDeleteAllRows();
                                handleCloseContextMenu();
                            }}
                        >
                            Delete All
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default TaxTemplateGrid
import { useState } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { getImageUrlPath } from "../../../helper";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";

import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";
import { useGetSocksTypeQuery } from "../../../redux/uniformService/SocksTypeMasterService";
import { useGetYarnNeedleMasterQuery } from "../../../redux/uniformService/YarnNeedleMasterservices";
import { useGetFiberContentMasterQuery } from "../../../redux/uniformService/FiberContentMasterServices";
import { getCommonParams, renameFile } from '../../../Utils/helper';
import { useGetMachineQuery } from "../../../redux/services/MachineMasterService";
import { CLOSE_ICON, DELETE, VIEW } from '../../../icons';

export default function OrderItems({ readOnly, itemHeading, setOrderDetails, orderDetails }) {
    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const params = {
        branchId, userId, finYearId
    };
    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });

    const { data: socksMaterialData } =
        useGetSocksMaterialQuery({ params: { ...params } });


    const { data: socksTypeData } =
        useGetSocksTypeQuery({ params: { ...params } });
    const { data: sizeList, isLoading: isSizeListLoading } = useGetSizeMasterQuery({ params: { ...params } });
    const { data: styleList, isLoading: isStyleListLoading } = useGetStyleMasterQuery({ params: { ...params } });
    const { data: Yarnlist } = useGetYarnNeedleMasterQuery({ params: { ...params } });
    const { data: machineList } = useGetMachineQuery({ params: { ...params } });
    const { data: fiberContent } = useGetFiberContentMasterQuery({ params: { ...params } });

    const {
        data: colorlist,
        isLoading: isColorListLoading,
        isFetching: isColorListFetching,
    } = useGetColorMasterQuery({ params });

    function addNewRow() {
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setOrderDetails(prev => [
            ...prev,
            {
                yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
                measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
                stripecolorId: "", design: "", noOfStripes: "0", qty: "0", socksTypeId: "",
            }
        ]);
    }

    function handleInputChange(value, index, field) {
        setOrderDetails(orderDetails => {
            const newBlend = structuredClone(orderDetails);
            newBlend[index][field] = value;
            return newBlend
        }
        );
    };


    function openPreview(filePath) {
        window.open(filePath instanceof File ? URL.createObjectURL(filePath) : getImageUrlPath(filePath))
    }

    function deleteRow(index) {
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setOrderDetails(prev => prev.filter((_, i) => i !== index))
    }

    function handleEdit() {
        return
    }


    return (
        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium text-slate-700">Item List</h2>
                <div className="flex gap-2 items-center">

                    <button
                        onClick={() => {
                            addNewRow()
                        }}
                        className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-sm"
                    >
                        <HiPlus className="w-3 h-3 mr-1" />
                        Add Item
                    </button>
                </div>

            </div>

            <div className="overflow-x-auto">

                <table className="w-full border-collapse table-fixed">
                    <thead className="bg-gray-200 text-gray-800">
                        <tr>
                            {itemHeading?.map((header, index, arr) => (
                                <th
                                    key={header}
                                    className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>

                        {(orderDetails ? orderDetails : []).map((item, index) =>
                            <tr className="border border-blue-gray-200 cursor-pointer " >
                                <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
                                <td className=" border border-gray-300 text-[11px] ">
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "styleId") } }}
                                        className='text-left rounded py-1 h-full'
                                        value={item?.styleId}

                                        onChange={(e) => handleInputChange(e.target.value, index, "styleId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "styleId")
                                        }}
                                    >

                                        <option value={""} key={""} >
                                            select
                                        </option>
                                        {styleList?.data?.map(size =>
                                            <option value={size.id || ""} key={size.id}   >
                                                {size?.name}
                                            </option>)}

                                    </select>
                                </td>



                                <td className=" py-0.5 px-3 border border-gray-300 overflow-x-auto">
                                    <div className='flex gap-2'>
                                        {(!readOnly && !item.filePath) &&
                                            <input
                                                title=" "
                                                type="file"
                                                disabled={readOnly}
                                                className='text-left w-full rounded py-1 h-full text-xs'
                                                onChange={(e) =>
                                                    e.target.files[0] ? handleInputChange(renameFile(e.target.files[0]), index, "filePath") : () => { }
                                                }
                                            />

                                        }
                                        {item.filePath &&
                                            <>
                                                <span className="text-xs">{item?.filePath?.name || item?.filePath}</span>
                                                <button className="text-xs" onClick={() => { openPreview(item.filePath) }}>
                                                    {VIEW}
                                                </button>
                                                {!readOnly &&
                                                    <button className="text-xs" onClick={() => { handleInputChange('', index, "filePath") }}>{CLOSE_ICON}</button>
                                                }
                                            </>
                                        }
                                    </div>
                                </td>

                                <td className="border border-gray-300 text-[11px] ">
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "yarnNeedleId") } }}
                                        className='text-left w-full rounded py-1 h-full'
                                        value={item?.yarnNeedleId}

                                        onChange={(e) => handleInputChange(e.target.value, index, "yarnNeedleId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "yarnNeedleId")
                                        }}
                                    >

                                        <option>
                                            select
                                        </option>
                                        {Yarnlist?.data?.map(size =>
                                            <option value={size.id || ""} key={size.id}   >
                                                {size?.name}
                                            </option>)}

                                    </select>
                                </td>

                                <td className=" border border-gray-300 text-[11px] ">
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "machineId") } }}
                                        className='text-left w-full rounded py-1 h-full'
                                        value={item?.machineId}

                                        onChange={(e) => handleInputChange(e.target.value, index, "machineId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "machineId")
                                        }}
                                    >

                                        <option>
                                            select
                                        </option>
                                        {machineList?.data?.map(size =>
                                            <option value={size.id || ""} key={size.id}   >
                                                {size?.name}
                                            </option>)}

                                    </select>
                                </td>
                                <td className="w-40 border border-gray-300 text-[11px] ">
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "fiberContentId") } }}
                                        className='text-left w-full rounded py-1 h-full'
                                        value={item?.fiberContentId}

                                        onChange={(e) => handleInputChange(e.target.value, index, "fiberContentId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "fiberContentId")
                                        }}
                                    >

                                        <option>
                                            select
                                        </option>
                                        {fiberContent?.data?.map(size =>
                                            <option value={size.id || ""} key={size.id}   >
                                                {size?.fabricName}
                                            </option>)}

                                    </select>
                                </td>
                                <td className="table-data w-40 text-left px-1 py-1 text-xs border border-gray-300">
                                    <textarea readOnly={readOnly} className=" w-full overflow-auto focus:outline-none  rounded text-xs"
                                        value={item.description}
                                        onChange={(e) => handleInputChange(e.target.value, index, "description")}

                                    >
                                    </textarea>

                                </td>
                                <td className="w-40 border border-gray-300 text-[11px] ">
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "socksMaterialId") } }}
                                        className='text-left w-full rounded py-1 h-full'
                                        value={item?.socksMaterialId}

                                        onChange={(e) => handleInputChange(e.target.value, index, "socksMaterialId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "socksMaterialId")
                                        }}
                                    >

                                        <option>
                                            select
                                        </option>
                                        {socksMaterialData?.data?.map(size =>
                                            <option value={size.id || ""} key={size.id}   >
                                                {size?.name}
                                            </option>)}

                                    </select>
                                </td>
                                <td className=" w-40  border border-gray-300 text-[11px] ">
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "socksTypeId") } }}
                                        className='text-left w-full rounded py-1 h-full'
                                        value={item?.socksTypeId}

                                        onChange={(e) => handleInputChange(e.target.value, index, "socksTypeId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "socksTypeId")
                                        }}
                                    >

                                        <option>
                                            select
                                        </option>
                                        {socksTypeData?.data?.map(size =>
                                            <option value={size.id || ""} key={size.id}   >
                                                {size?.name}
                                            </option>)}

                                    </select>
                                </td>
                                <td className="w-40  border border-gray-300 text-[11px] ">
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "legcolorId") } }}
                                        className='text-left w-full rounded py-1 h-full'
                                        value={item?.legcolorId}

                                        onChange={(e) => handleInputChange(e.target.value, index, "legcolorId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "legcolorId")
                                        }}
                                    >

                                        <option>
                                            select
                                        </option>
                                        {colorlist?.data?.map(color =>
                                            <option value={color.id || ""} key={color.id}   >
                                                {color?.name}
                                            </option>)}
                                    </select>
                                </td>
                                <td className="w-40  border border-gray-300 text-[11px] ">
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "footcolorId") } }}
                                        className='text-left w-full rounded py-1 h-full'
                                        value={item?.footcolorId}

                                        onChange={(e) => handleInputChange(e.target.value, index, "footcolorId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "footcolorId")
                                        }}
                                    >

                                        <option>
                                            select
                                        </option>
                                        {colorlist?.data?.map(color =>
                                            <option value={color.id || ""} key={color.id}   >
                                                {color?.name}
                                            </option>)}
                                    </select>
                                </td>
                                <td className=" w-40 border border-gray-300 text-[11px] ">
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "stripecolorId") } }}
                                        className='text-left w-full rounded py-1 h-full'
                                        value={item?.stripecolorId}

                                        onChange={(e) => handleInputChange(e.target.value, index, "stripecolorId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "stripecolorId")
                                        }}
                                    >

                                        <option>
                                            select
                                        </option>
                                        {colorlist?.data?.map(color =>
                                            <option value={color.id || ""} key={color.id}   >
                                                {color?.name}
                                            </option>)}
                                    </select>
                                </td>
                                <td className="w-40  border border-gray-300 text-[11px] ">
                                    <input className='text-right w-full h-full p-1.5 border-gray-200 '
                                        type="number"
                                        value={item?.noOfStripes || 0}
                                        onChange={(e) => { handleInputChange(e.target.value, index, "noOfStripes") }} onFocus={(e) => { e.target.select() }} min={0}
                                    />

                                </td>


                                <td className="w-40  border-blue-gray-200 text-[11px] border border-gray-300">
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                        className='text-left w-full rounded py-1 h-full'
                                        value={item?.sizeId}

                                        onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "sizeId")
                                        }}
                                    >

                                        <option>
                                            select
                                        </option>
                                        {sizeList?.data?.map(size =>
                                            <option value={size.id || ""} key={size.id}   >
                                                {size?.name}
                                            </option>)}

                                    </select>
                                </td>
                                <td className="w-40  border border-gray-300 text-[11px] ">
                                    <input className='text-right w-full h-full p-1.5 border-gray-200 '
                                        type="text"
                                        value={item?.measurements || 0}
                                        onChange={(e) => { handleInputChange(e.target.value, index, "measurements") }} onFocus={(e) => { e.target.select() }} min={0}
                                    />

                                </td>


                                <td className="w-40 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                    <input className='text-right w-full p-1.5 '
                                        type="number"
                                        value={item?.qty}
                                        onChange={(e) => { handleInputChange(e.target.value, index, "qty") }} onFocus={(e) => { e.target.select() }} min={0}
                                    />

                                </td>

                                <td className="w-40 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                    <input className='text-right w-full p-1.5 '
                                        type="number"
                                        value={item?.weightOfSocks}
                                        onChange={(e) => { handleInputChange(e.target.value, index, "weightOfSocks") }} onFocus={(e) => { e.target.select() }} min={0}
                                    />

                                </td>

                                {/* <td className=" text-center border-blue-gray-200 text-[11px] border border-gray-300">
                                    <button
                                        tabIndex={-1}
                                        type='button'
                                        onClick={() => {
                                            deleteRow(index)
                                        }}
                                        className='text-xs text-red-600 '>{DELETE}
                                    </button>
                                </td> */}


                                <td className="w-40 px-4 py-1">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded text-xs flex items-center gap-1"
                                        >
                                            <HiPencil className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteRow(item.id)}
                                            className="text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded text-xs flex items-center gap-1"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>


            </div>
        </div>
    );
}



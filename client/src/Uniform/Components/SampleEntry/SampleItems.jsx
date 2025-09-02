import React, { useState } from 'react';
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
import TableGridItems from './TableGridItems';
import Modal from "../../../UiComponents/Modal";
import { FaInfoCircle } from 'react-icons/fa';
import SizeDetailsSubGrid from './SizeDetailsSubGrid';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetCountsMasterQuery } from '../../../redux/uniformService/CountsMasterServices';
import { useGetYarnTypeMasterQuery } from '../../../redux/uniformService/YarnTypeMasterServices';

export default function SampleItems({ newSampleEntry, readOnly, setSampleDetails, sampleDetails, id, orderId }) {
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [tableDataView, setTableDataView] = useState(false)
    const [currentItem, setCurrentItem] = useState();
    const [currentIndex, setCurrentIndex] = useState("");
    const [gridEditableIndex, setGridEditableIndex] = useState(null);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const params = {
        branchId, userId, finYearId
    };

    console.log(sampleDetails, "sampleDetails")


    const { data: socksMaterialData } =
        useGetSocksMaterialQuery({ params: { ...params } });


    const { data: socksTypeData } =
        useGetSocksTypeQuery({ params: { ...params } });
    const { data: sizeList, isLoading: isSizeListLoading } = useGetSizeMasterQuery({ params: { ...params } });
    const { data: styleList, isLoading: isStyleListLoading } = useGetStyleMasterQuery({ params: { ...params } });
    const { data: gsmList } = useGetgsmQuery({ params: { ...params } });
    const { data: uomList } = useGetUomQuery({ params: { ...params } });
    const { data: yarnNeedleList } = useGetYarnNeedleMasterQuery({ params: { ...params } });




    function addNewRow() {
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setSampleDetails(prev => [
            ...prev,
            {
                yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
                measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
                stripecolorId: "", design: "", noOfStripes: "0", qty: 0.00, socksTypeId: "",
                sampleSizeDetails: [{ qty: "0.00", sizeId: "", Weight: '0.000' }]
            }
        ]);
    }






    function handleInputChange(value, index, field) {
        setSampleDetails(sampleDetails => {
            const newBlend = structuredClone(sampleDetails);

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
        setSampleDetails(prev => prev.filter((_, i) => i !== index))
    }

    function handleEdit(index) {
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setGridEditableIndex(index)

    }

    function handleView(index) {
        setCurrentIndex(index)
        setTableDataView(true)
    }


    function handleAdd(index) {
        setSampleDetails(prev => {
            const newPrev = structuredClone(prev);


            if (!Array.isArray(newPrev[index].sampleSizeDetails)) {
                newPrev[index].sampleSizeDetails = [];
            }
            newPrev[index].sampleSizeDetails.push({
                qty: 0.00, sizeId: "", weight: ""
            });
            return newPrev;
        });
    }



    const [selectedIndex, setSelectedIndex] = useState("");

    const { data: yarnList } = useGetYarnMasterQuery({ params: { ...params } });
    const { data: countsList } = useGetCountsMasterQuery({ params: { ...params } });


    const { data: machineList } = useGetMachineQuery({ params: { ...params } });
    const { data: fiberContent } = useGetFiberContentMasterQuery({ params: { ...params } });
    const { data: yarnType } = useGetYarnTypeMasterQuery({ params: { ...params } });
    const {
        data: colorlist,
        isLoading: isColorListLoading,
        isFetching: isColorListFetching,
    } = useGetColorMasterQuery({ params });

    function setIndex(index) {
        setSelectedIndex(index)

    }
    return (

        <>
            <Modal
                isOpen={tableDataView}
                onClose={() => setTableDataView(false)}
                widthClass="px-2 h-[70%] w-[70%]"
            >{
                    console.log(sampleDetails, "sampleDetails")}
                <TableGridItems
                    // item={sampleDetails[selectedIndex ? selectedIndex  : null]}
                    gridIndex={selectedIndex}
                    selectedIndex={selectedIndex}
                    id={id}
                    yarnTypeList={yarnType}
                    gridEditableIndex={gridEditableIndex}
                    handleInputChange={handleInputChange}
                    currentItem={currentItem}
                    currentIndex={currentIndex}
                    yarnList={yarnList}
                    countsList={countsList}
                    yarnNeedleList={yarnNeedleList}
                    colorlist={colorlist}
                    socksTypeData={socksTypeData}
                    readOnly={readOnly}
                    styleList={styleList?.data}
                    setSampleDetails={setSampleDetails}
                    sampleDetails={sampleDetails}
                    onClose={() => setTableDataView(false)}

                />
                {/* ))} */}
            </Modal>

            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-medium text-slate-700">List Of Items</h2>
                    {newSampleEntry &&

                        <div className="flex gap-2 items-center">

                            <button
                                onClick={() => {
                                    addNewRow()
                                }}
                                className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                            >
                                <HiPlus className="w-3 h-3 mr-1" />
                                Add Item
                            </button>
                        </div>
                    }


                </div>

                <div className="overflow-x-auto">

                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800">
                            <tr>
                                <th
                                    className={`w-8 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Style
                                </th>
                                <th

                                    className={`w-48 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Image
                                </th>

                                <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Socks Material
                                </th>
                                <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Socks Type
                                </th>

                                <th

                                    className={`w-8  text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            {(sampleDetails ? sampleDetails : [])?.map((item, index) => {
                                return (
                                    <React.Fragment>
                                        <tr className="border border-blue-gray-200 cursor-pointer " >
                                            <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
                                            <td className=" px-1 border border-gray-300 text-[11px] ">
                                                <select
                                                    // disabled={true}
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "styleId") } }}
                                                    className='text-left rounded  py-1.5 w-full'
                                                    value={item?.styleId}

                                                    // disabled={(id ? gridEditableIndex !== index : false)}
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
                                                    {(!readOnly && !item?.filePath) &&
                                                        <input
                                                            title=" "
                                                            type="file"
                                                            // disabled={(id ? gridEditableIndex !== index : false)}
                                                            //   disabled={true}

                                                            className='text-left w-full rounded h-full text-xs'
                                                            onChange={(e) =>
                                                                e.target.files[0] ? handleInputChange(renameFile(e.target.files[0]), index, "filePath") : () => { }
                                                            }
                                                        />

                                                    }
                                                    {item?.filePath &&
                                                        <>
                                                            <span className="text-xs">{item?.filePath?.name || item?.filePath}</span>
                                                            <button className="text-xs" onClick={() => { openPreview(item?.filePath) }}>
                                                                {VIEW}
                                                            </button>
                                                            {!readOnly &&
                                                                <button className="text-xs" onClick={() => { handleInputChange('', index, "filePath") }}>{CLOSE_ICON}</button>
                                                            }
                                                        </>
                                                    }
                                                </div>
                                            </td>








                                            <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                                                <select
                                                    //  disabled={true}
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "socksMaterialId") } }}
                                                    className='text-left w-full rounded  h-full py-1'
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
                                            <td className=" w-40  border border-gray-300 text-[11px] py-0.5">
                                                <select
                                                    // disabled={true}
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "socksTypeId") } }}
                                                    className='text-left w-full rounded py-1.5 h-full'
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




                                            <td className="w-8  py-1 text-center">
                                                <div className="flex space-x-2  justify-end">

                                                    <button
                                                        onClick={() => {
                                                            handleView(index)
                                                            setIndex(index)
                                                        }}
                                                        onMouseEnter={() => setTooltipVisible(true)}
                                                        onMouseLeave={() => setTooltipVisible(false)}
                                                        className="text-blue-800 flex items-center  bg-blue-50 rounded"
                                                    >
                                                        👁 <span className="text-xs"></span>
                                                    </button>
                                                    <span className="tooltip-text">View</span>
                                                    <>

                                                        <button
                                                            onClick={() => handleEdit(index)}
                                                            className="text-green-600 hover:text-green-800 bg-green-50 py-1 rounded text-xs flex items-center"
                                                        >
                                                            <HiPencil className="w-4 h-4" />

                                                        </button>
                                                        <span className="tooltip-text">Edit</span>
                                                        <button
                                                            onClick={() => deleteRow(index)}
                                                            className="text-red-600 hover:text-red-800 bg-red-50  py-1 rounded text-xs flex items-center"
                                                        >
                                                            <HiTrash className="w-4 h-4" />

                                                        </button>
                                                        <span className="tooltip-text">Delete</span>
                                                    </>


                                                    {tooltipVisible && (
                                                        <div className="absolute  z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                                                            <div className="flex items-start">
                                                                <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                                                <span>View</span>
                                                            </div>
                                                            <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <SizeDetailsSubGrid
                                            gridIndex={index}
                                            id={id}
                                            item={item}
                                            orderId={orderId}
                                            sampleDetails={sampleDetails}
                                            setSampleDetails={setSampleDetails}
                                            readOnly={readOnly}
                                            colorList={colorlist}
                                            sizeList={sizeList}
                                            handleAdd={handleAdd}
                                            gsmList={gsmList}
                                            handleInputChange={handleInputChange}
                                            index={index}
                                            uomList={uomList}
                                            yarnNeedleList={yarnNeedleList}
                                        //   singleuomData={singleuomData}
                                        />
                                    </React.Fragment>




                                )
                            })}

                        </tbody>
                    </table>


                </div>
            </div>
        </>



    );
}



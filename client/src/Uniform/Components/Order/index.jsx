import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    useGetOrderQuery,
    useGetOrderByIdQuery,
    useAddOrderMutation,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
} from "../../../redux/uniformService/OrderService";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DisabledInput, DateInput, DropdownInput, TextInput} from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import FormReport from "./FormReport";
import moment from "moment";
import { getCommonParams } from "../../../Utils/helper";
import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "./PrintFormat-OR";
import tw from "../../../Utils/tailwind-react-pdf";
import { sampleUpdateStage } from "../../../Utils/DropdownData";
import {  Loader } from "../../../Basic/components";
import { RiPlayListAddLine } from "react-icons/ri";
import { DELETE } from "../../../icons";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import {  useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";


const MODEL = "Order";

export default function Form() {

    const [readOnly, setReadOnly] = useState(false);
    const [isForOrderImportItems, setIsForOrderImportItems] = useState(false)
    const [docId, setDocId] = useState("")
    const [id, setId] = useState("");
    const [formReport, setFormReport] = useState(false);
    const [active, setActive] = useState(true);
    const [orderQty, setOrderQty] = useState("")
    const [validDate, setValidDate] = useState()
    const [orderDetails, setOrderDetails] = useState([]);
    const [tempOrderDetails, setTempOrderDetails] = useState([]);
    const [phone, setPhone] = useState()
    const [address, setAddress] = useState()
    const [contactPersonName, setContactPersonName] = useState("")
    const [noOfSet, setNoOfSet] = useState("")
    const [partyId, setPartyId] = useState("");
    const [date, setDate] = useState("");
    const childRecord = useRef(0);
    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const [printModalOpen, setPrintModalOpen] = useState(false)
  
    const [loading, setLoading] = useState(false);
   

    const params = {
        branchId, userId, finYearId
    };
 

    const { data: allData, isLoading, isFetching } = useGetOrderQuery({ params, searchParams: '' });
    const { data: sizeList,   isLoading: isSizeListLoading   } = useGetSizeMasterQuery({ params: { ...params } });

    const {
        data: colorlist,
        isLoading: isColorListLoading,
        isFetching: isColorListFetching,
    } = useGetColorMasterQuery({ params });


    const getNextDocId = useCallback(() => {
        if (id || isLoading || isFetching) return
        if (allData?.nextDocId) {
            setDocId(allData.nextDocId)
        }
    }, [allData, isLoading, isFetching, id])

    useEffect(getNextDocId, [getNextDocId])

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetOrderByIdQuery(id, { skip: !id });





    const [addData] = useAddOrderMutation();
    const [updateData] = useUpdateOrderMutation();
    const [removeData] = useDeleteOrderMutation();

    const { data: singleSupplier, isLoading: isSingleSupplierLoading, isFetching: isSingleSupplierFetching } =
        useGetPartyByIdQuery(partyId, { skip: !partyId });

    const syncFormWithDb = useCallback((data) => {
        if (id) {
            setReadOnly(true);
        } else {
            setReadOnly(false);
        }
        if (data?.docId) {
            setDocId(data?.docId)
        }

        setDate(data?.createdAt ? moment(data?.createdAt).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD"));
        setPartyId(data?.partyId ? data?.partyId : "");
        setContactPersonName(data?.contactPersonName ? data?.contactPersonName : "")
        setPhone(data?.phone ? data?.phone : "");
        setAddress(data?.address ? data?.address : "");
        setIsForOrderImportItems(data?.isForOrderImportItems ? data?.isForOrderImportItems : false)
        setValidDate(data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : "");
        setOrderDetails(data?.orderDetails ? data?.orderDetails : []);
        setNoOfSet(data?.noOfSet ? data?.noOfSet : "")
    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        branchId, id, userId, companyId, active, orderQty, noOfSet, isForOrderImportItems,
        partyId, finYearId, phone, contactPersonName, address, validDate, orderDetails: orderDetails?.filter(val => val.itemTypeId !== "")
    }

    const validateData = (data) => {
        let filterData = data?.orderDetails?.filter(val => val.itemTypeId !== "")
        if (filterData?.length > 0 && data.partyId && data?.noOfSet) {
            return true
        }

        return false
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            if (returnData.statusCode === 0) {

                setId("")
                syncFormWithDb(undefined)
                toast.success(text + "Successfully");
            } else {
                toast.error(returnData?.message)
            }
        } catch (error) {
            console.log("handle")
        }
    }





    // const handleSubmitCustom = async (callback, data, text) => {
    //     try {
    //         const formData = new FormData();
    //         for (let key in data) {
    //             formData.append(key, data[key]);
    //         }
    //         let returnData;
    //         if (text === "Updated") {
    //             returnData = await callback({ id, body: data }).unwrap();
    //         } else {
    //             returnData = await callback(formData).unwrap();
    //         }
    //         if (returnData?.statusCode === 0) {
    //             onNew()
    //             toast.success(text + "Successfully");
    //         } else {
    //             toast.error(returnData.message);
    //         }
    //     } catch (error) {
    //         console.log("handle");
    //     }
    // };

    const saveData = () => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" })
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    }

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
                setId("");
                onNew();
                toast.success("Deleted Successfully");
            } catch (error) {
                toast.error("something went wrong");
            }
        }
    };

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };

    const onNew = () => {
        setId("");
        setReadOnly(false);
        setOrderDetails([]);

    }


  function addNewRow() {
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setOrderDetails(prev => [
            ...prev,
            {
                sockType: "", Material: "", size: "", color: "", design: "", qty: "0", packingRequirement: "",
            }
        ]);
    }

    function deleteRow(index) {
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setOrderDetails(prev => prev.filter((_, i) => i !== index))
    }


    useEffect(() => {
        if (orderDetails?.length >= 10) return
        setOrderDetails(prev => {
            let newArray = Array.from({ length: 10 - prev.length }, () => {
                return {
                    sockType: "", Material: "", size: "", color: "", design: "", qty: "0", packingRequirement: "",
                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setOrderDetails, orderDetails])

    function handleInputChange(value, index, field) {
        setOrderDetails(orderDetails => {
        const newBlend = structuredClone(orderDetails);
        newBlend[index][field] = value;
         return newBlend
     }
     );
    };
   
         console.log(orderDetails, "orderDetails")
     

    return (
        <>
            <div
                onKeyDown={handleKeyDown}
                className="md:items-start md:justify-items-center  bg-theme h-[800px]  ">

                <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
                    <FormReport
                        heading={MODEL}
                        loading={
                            isLoading || isFetching
                        }
                        tableWidth="100%"
                        data={allData?.data}
                        onClick={(id) => {
                            setId(id);
                            setFormReport(false);
                        }
                        }
                    />
                </Modal>
                <Modal
                    isOpen={printModalOpen}
                    onClose={() => setPrintModalOpen(false)}
                    widthClass={"w-[90%] h-[90%]"}
                >
                    <PDFViewer style={tw("w-full h-full")}>
                        <PrintFormat
                            singleData={id ? singleData?.data : "Null"}
                            date={id ? singleData?.data?.selectedDate : date}
                            docId={docId ? docId : ""}
                            tempOrderDetails={tempOrderDetails}
                        />
                    </PDFViewer>
                </Modal>


                <div className="flex flex-col frame w-full ">
                    <div className="bg-gray-700">
                        <FormHeader
                            onNew={onNew}
                            model={MODEL}
                            saveData={saveData}
                            setReadOnly={setReadOnly}
                            deleteData={deleteData}
                            openReport={() => { setFormReport(true) }}
                            onPrint={id ? () => setPrintModalOpen(true) : null}
                            childRecord={childRecord.current}
                        />
                    </div>

                    <div className="flex-1 grid gap-x-2 p-3">
                        <div className="col-span-3 grid ">
                            <div className='col-span-3 grid '>
                                <div className='mr-1'>
                                    <div className={`grid`}>
                                        <div className={"flex flex-col gap-x-2 h-[100vh] gap-y-4"}>
                                            <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 p-1 h-[20vh]'>
                                                <legend className='sub-heading'>Order Info</legend>
                                                <div className='flex flex-col justify-center items-start flex-1 w-full'>
                                                    <div className="grid grid-cols-6 w-full">
                                                        <DisabledInput name="Doc Id." value={docId} required={true} />
                                                        <DateInput name="Order Date" value={date} type={"date"} required={true} readOnly={readOnly} disabled />
                                                        <DateInput name="Delivery.Date" value={validDate} setValue={setValidDate} readOnly={readOnly} />
                                                        <DropdownInput name="Customer"
                                                            //  options={dropDownListObject(supplierListBasedOnSupply, "name", "id")}
                                                            options={sampleUpdateStage}
                                                            value={partyId} setValue={setPartyId} required={true} readOnly={readOnly} />
                                                        <TextInput name="Phone No" type="text" value={phone} setValue={setPhone} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                        <TextInput name=" Billing Address" type="text" value={address} setValue={setAddress} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                                        <TextInput name="Shipping Address" type="number" value={noOfSet} setValue={setNoOfSet} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                                    </div>
                                                </div>
                                            </fieldset>



                                            <div className="row w-full mx-auto">
                                                <div className="text-xs col-12 px-0 bg-light bg-opacity-15 rounded-lg border shadow-md">

                                                    <div className="flex justify-between mx-3 items-center py-1">
                                                        <div className='text-normal flex items-center text-gray-600'>

                                                            <RiPlayListAddLine size={20} className=' mr-0.5' />
                                                            &nbsp; <div className='my-0'>
                                                                <div className=' text-[13px] text-black my-0'>Order Info</div>
                                                            </div>
                                                        </div>
                                                     
                                                    </div>


                                                    {loading ? (
                                                        <Loader />
                                                    ) : (
                                                        <>
                                                            {data?.length === 0 ? (
                                                                <div className="flex-1 flex justify-center bg-white  text-gray-800 items-center text-xl py-3">
                                                                    <p>No Data Found...! </p>
                                                                </div>
                                                            ) :
                                                    <div className="h-[50vh] overflow-y-auto">



        <div className=" bg-white  custom-scrollbar border-y border-gray-200   ">
            <table className="w-full  text-normal  overflow-y-auto  ">
                <thead>
                    <tr className=" bg-gray-400 text-[12px]">
                        <th className="px-4 py-2 w-2 text-center p-0.5">S No</th>
                        <th className="px-4 py-2 w-64 ">Sock Type</th>
                        <th className="px-4 py-2 w-64">Material</th>
                        <th className="px-4 py-2 w-64 ">Size</th>
                        <th className="px-4 py-2 w-64 ">Color</th>
                        <th className="px-4 py-2 w-64 ">Design</th>
                        <th className="px-4 py-2 w-64 ">Qty/Sie</th>
                        <th className="px-4 py-2 w-64 ">Packing Requirement</th>
                        <th className="table-data  w-16 p-0.5" >
                            <button className='text-2xl' onClick={addNewRow}>+</button>
                        </th>

                    </tr>
                </thead>

                <tbody className="text-blue-gray-900 ">
                    {(orderDetails ? orderDetails : []).map((item, index) =>



                        <tr className="border-b border-blue-gray-200 cursor-pointer " >

                            <td className="h-[30px]   border-blue-gray-200 text-[11px]  w-2 text-center p-0.5 ">{index + 1}</td>
                            <td className="h-[30px]   border-blue-gray-200 text-[11px] "> {item?.sockType}  </td>
                            <td className="h-[30px]   border-blue-gray-200 text-[11px] ">{item?.Material}</td>

                          
                            <td className="h-[30px]   border-blue-gray-200 text-[11px] ">
                                      <select
                                            disabled={readOnly}
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "size") } }}
                                            className='text-left w-full rounded py-1 table-data-input'
                                            value={item?.size}
                                    
                                            onChange={(e) => handleInputChange(e.target.value, index, "size")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "size")
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
                            <td className="h-[30px]   border-blue-gray-200 text-[11px] ">
                            <select
                                            disabled={readOnly}
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "color") } }}
                                            className='text-left w-full rounded py-1 table-data-input'
                                            value={item?.color}
                                    
                                            onChange={(e) => handleInputChange(e.target.value, index, "color")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "color")
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

                            <td className="h-[30px]   border-blue-gray-200 text-[11px] ">{item?.design}</td>
                            <td className="h-[30px]   border-blue-gray-200 text-[11px] text-right ">
                                <input  className='text-right w-full p-1.5 border-gray-200 '
                                    type="number"
                                    value={item?.qty} 
                                    onChange={(e) => { handleInputChange(e.target.value, index, "qty") }}   onFocus={(e) => { e.target.select() }} min={0}
                                    />
                                
                            </td>
                            <td className="h-[30px]   border-blue-gray-200 text-[11px] ">{item?.packingRequirement}</td>
                            <td className="h-[30px]   border-blue-gray-200 text-[11px] ">
                                <button
                                    tabIndex={-1}
                                    type='button'
                                    onClick={() => {
                                        deleteRow(index)
                                    }}
                                    className='text-xs text-red-600 '>{DELETE}
                                </button>
                            </td>
                        </tr>

                    )}

                    <tr className='w-full h-7  '>
                        <td className=" text-center w-10 font-bold" colSpan={4}>Total</td>
                        <td className=" text-center w-10 font-bold">{orderDetails.reduce((a, item) => a + parseFloat(
                            (parseFloat((item?.orderQty) || 0) * parseFloat(item?.price) || 0)
                        ), 0).toFixed(2)}</td>
                        <td className=''>
                        </td>
                        <td className="  w-10 text-right pr-1">{orderDetails.reduce((a, c) => a + parseFloat(c.orderQty || 0), 0)}</td>

                        {/* <td className=" text-center w-10 font-bold">{orderDetails.reduce((a, item, index) => a + parseFloat(
                            priceWithTax((parseFloat((item?.orderQty) || 0) * parseFloat(item?.price) || 0), item?.tax || 0)
                        ), 0).toFixed(2)}</td> */}
                        <td className=''>
                        </td>
                    </tr>
                </tbody>






                                                            </table>
                                                        </div>

                                                    </div>
                                                }
                                            </>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</>

);
}
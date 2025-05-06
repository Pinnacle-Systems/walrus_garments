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
import { DisabledInput, DateInput, DropdownInput, TextInput, CheckBox } from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import FormReport from "./FormReport";
import moment from "moment";
import { getCommonParams } from "../../../Utils/helper";
import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "./PrintFormat-OR";
import tw from "../../../Utils/tailwind-react-pdf";
import { packingCover, sampleUpdateStage } from "../../../Utils/DropdownData";
import { Loader } from "../../../Basic/components";
import { RiPlayListAddLine } from "react-icons/ri";
import { DELETE } from "../../../icons";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";
import { useGetSocksTypeQuery } from "../../../redux/uniformService/SocksTypeMasterService";


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
    const [contactPersonName, setContactPersonName] = useState("");
    const [name, setName] = useState("");
    const [noOfSet, setNoOfSet] = useState("")
    const [partyId, setPartyId] = useState("");
    const [date, setDate] = useState("");
    const childRecord = useRef(0);
    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const [printModalOpen, setPrintModalOpen] = useState(false)
    const [packingCoverType, setPackingCoverType] = useState("")
    const [loading, setLoading] = useState(false);
    const [socksMaterial, setSocksMaterial] = useState("")
    const [socksType, setSocksType] = useState("");
    const [legColor, setLegColor] = useState("")
    const [footColor, setFootColor] = useState("")
    const [stripeColor, setStripeColor] = useState("");
    const [noOfStripes, setNoOfStripes] = useState(0);


    const [isLogo, setIsLogo] = useState(false)
    const params = {
        branchId, userId, finYearId
    };
    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });

    const { data: socksMaterialData } =
        useGetSocksMaterialQuery({ params: { ...params } });


    const { data: socksTypeData } =
        useGetSocksTypeQuery({ params: { ...params } });

    const { data: allData, isLoading, isFetching } = useGetOrderQuery({ params, searchParams: '' });
    const { data: sizeList, isLoading: isSizeListLoading } = useGetSizeMasterQuery({ params: { ...params } });
    const { data: styleList, isLoading: isStyleListLoading } = useGetStyleMasterQuery({ params: { ...params } });

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
        // setIsForOrderImportItems(data?.isForOrderImportItems ? data?.isForOrderImportItems : false)
        setValidDate(data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : "");
        setOrderDetails(data?.orderDetails ? data?.orderDetails : []);
        setPackingCoverType(data?.packingCoverType ? data?.packingCoverType : "");
        setSocksMaterial(data?.socksMaterial ? data?.socksMaterial : "");
        setSocksType(data?.socksType ? data?.socksType : "");
        setLegColor(data?.legColor ? data?.legColor : "");
        setFootColor(data?.footColor ? data?.footColor : "");
        setStripeColor(data?.stripeColor ? data?.stripeColor : "");
        setNoOfStripes(data?.noOfStripes ? data?.noOfStripes : 0);
        setName(data?.name ? data?.name : "");

        // setNoOfSet(data?.noOfSet ? data?.noOfSet : "")
    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        branchId, id, userId, companyId, packingCoverType, name,
        //  active, orderQty, noOfSet, isForOrderImportItems,
        partyId, finYearId, phone, contactPersonName, address, validDate, orderDetails, socksMaterial, socksType,
        legColor, footColor, stripeColor, noOfStripes
    }

    const validateData = (data) => {

        if (orderDetails?.length > 0 && data.partyId) {
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
                sizeId: "", styleId: "", description: "", qty: "0", needle: "",
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
                    sockType: "", Material: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "", stripecolorId: "", design: "", noOfStripes: "0", qty: "0", packingRequirement: "",
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




    useEffect(() => {
        if (id) return
        if (!singleSupplier?.data || isSingleSupplierLoading || isSingleSupplierFetching) return
        if (!partyId) return
        setPhone(singleSupplier?.data?.contactMobile ? singleSupplier?.data.contactMobile : "")
        setContactPersonName(singleSupplier?.data?.contactPersonName ? singleSupplier?.data.contactPersonName : "");
        setAddress(singleSupplier?.data?.address ? singleSupplier?.data.address : "");
    }, [setPhone, setContactPersonName, partyId, singleSupplier, isSingleSupplierLoading, isSingleSupplierFetching])

    let supplierListBasedOnSupply = supplierList ? supplierList.data?.filter(val => val?.isBuyer) : []
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
                                        <div className={"flex flex-col gap-x-2 h-[130vh] gap-y-4"}>
                                            <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 p-1 h-[36vh]'>
                                                <legend className='sub-heading'>Order Info</legend>
                                                <div className='flex flex-col justify-center items-start flex-1 w-full'>
                                                    <div className="grid grid-cols-5 gap-x-2 w-full">
                                                        <DisabledInput name="Doc Id." value={docId} required={true} />
                                                        <DateInput name="Order Date" value={date} type={"date"} required={true} readOnly={true} disabled />
                                                        <DateInput name="Delivery.Date" value={validDate} setValue={setValidDate} readOnly={readOnly} />
                                                        <DropdownInput name="Customer" options={dropDownListObject((supplierList?.data || []), "name", "id")} value={partyId} setValue={setPartyId} required={true} readOnly={readOnly} />
                                                        <DropdownInput name="Socks Material" options={dropDownListObject((socksMaterialData?.data || []), "name", "id")} value={socksMaterial} setValue={setSocksMaterial} required={true} readOnly={readOnly} />
                                                        <DropdownInput name="Socks Type" options={dropDownListObject((socksTypeData?.data || []), "name", "id")} value={socksType} setValue={setSocksType} required={true} readOnly={readOnly} />
                                                        <DropdownInput name="Packing.Cover" options={packingCover} value={packingCoverType} setValue={setPackingCoverType} required={true} readOnly={readOnly} />

                                                        <DropdownInput name="Leg Color" options={dropDownListObject((colorlist?.data || []), "name", "id")} value={legColor} setValue={setLegColor} required={true} readOnly={readOnly} />
                                                        <DropdownInput name="Foot Color" options={dropDownListObject((colorlist?.data || []), "name", "id")} value={footColor} setValue={setFootColor} required={true} readOnly={readOnly} />
                                                        <DropdownInput name="Stripe Color" options={dropDownListObject((colorlist?.data || []), "name", "id")} value={stripeColor} setValue={setStripeColor} required={true} readOnly={readOnly} />
                                                        <TextInput name="NoOfStripes" type="text" value={noOfStripes} setValue={setNoOfStripes} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                                        {/* <TextInput name="LogoName" type="text" value={name} setValue={setName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} /> */}


                                                        <TextInput name="Con.Person.Name" type="text" value={contactPersonName} setValue={setContactPersonName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />

                                                        <TextInput name="Phone No" type="text" value={phone} setValue={setPhone} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                        <TextInput name=" Billing Address" type="text" value={address} setValue={setAddress} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                                        {/* <div className="col-span-5 flex justify-start mt-1">

                                                            <CheckBox name="Name/Logo" readOnly={readOnly} value={isLogo} setValue={setIsLogo} />
                                                        </div> */}
                                                        <TextInput name="LogoName" type="text" value={name} setValue={setName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />

                                                        {/* <TextInput name=" Billing Address" type="text" value={address} setValue={setAddress} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} /> */}
                                                        {/* <TextInput name="Shipping Address" type="number" value={noOfSet} setValue={setNoOfSet} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} /> */}
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
                                                                        <table className="border border-gray-500 table-auto w-full">
                                                                            <thead className="border border-gray-500">
                                                                                <tr className=" bg-gray-400">
                                                                                    <th className=" border border-gray-500 text-sm px-2 py-0.5 w-12 text-center p-0.5">S No</th>
                                                                                    <th className="px-2 py-0.5  border border-gray-500 text-sm">Style</th>
                                                                                    <th className="px-2 py-0.5  border border-gray-500 text-sm">Desc</th>

                                                                                    <th className="px-2 py-0.5  border border-gray-500 text-sm">Size</th>


                                                                                    <th className="px-2 py-0.5  w-24 border border-gray-500 text-sm">Qty/Sie</th>

                                                                                    <th className="table-data  w-16 p-0.5 border border-gray-500 text-sm" >
                                                                                        <button className='text-2xl' onClick={addNewRow}>+</button>
                                                                                    </th>

                                                                                </tr>
                                                                            </thead>

                                                                            <tbody className="text-blue-gray-900 ">{console.log("orderDetails", orderDetails)}
                                                                                {(orderDetails ? orderDetails : []).map((item, index) =>
                                                                                    <tr className="border-b border-blue-gray-200 cursor-pointer " >
                                                                                        <td className="h-[30px]   border-blue-gray-200 text-[11px]  text-center p-0.5 ">{index + 1}</td>
                                                                                        <td className="h-[30px]   border-blue-gray-200 text-[11px] ">  <select
                                                                                            disabled={readOnly}
                                                                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "styleId") } }}
                                                                                            className='text-left w-full rounded py-1 table-data-input'
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
                                                                                        <td className="table-data w-9 text-left px-1 py-1 text-xs">
                                                                                            <textarea readOnly={readOnly} className=" w-full overflow-auto focus:outline-none border border-gray-500 rounded py-1 text-xs"
                                                                                                value={item.description}
                                                                                                onChange={(e) => handleInputChange(e.target.value, index, "description")}

                                                                                            >
                                                                                            </textarea>

                                                                                        </td>




                                                                                        {/* <td className="h-[30px]   border-blue-gray-200 text-[11px] ">{item?.Material}</td> */}
                                                                                        <td className="h-[30px] w-32  border-blue-gray-200 text-[11px] ">
                                                                                            <select
                                                                                                disabled={readOnly}
                                                                                                onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                                                                                className='text-left w-full rounded py-1 table-data-input'
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
                                                                                        {/* <td className="h-[30px] w-32  border-blue-gray-200 text-[11px] ">
                                                                                            <select
                                                                                                disabled={readOnly}
                                                                                                onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "legcolorId") } }}
                                                                                                className='text-left w-full rounded py-1 table-data-input'
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
                                                                                        <td className="h-[30px] w-32  border-blue-gray-200 text-[11px] ">
                                                                                            <select
                                                                                                disabled={readOnly}
                                                                                                onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "footcolorId") } }}
                                                                                                className='text-left w-full rounded py-1 table-data-input'
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
                                                                                        <td className="h-[30px] w-32  border-blue-gray-200 text-[11px] ">
                                                                                            <select
                                                                                                disabled={readOnly}
                                                                                                onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "stripecolorId") } }}
                                                                                                className='text-left w-full rounded py-1 table-data-input'
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
                                                                                        <td className="h-[30px]   border-blue-gray-200 text-[11px] text-right ">
                                                                                            <input className='text-right w-20 p-1.5 border-gray-200 '
                                                                                                type="number"
                                                                                                value={item?.noOfStripes || 0}
                                                                                                onChange={(e) => { handleInputChange(e.target.value, index, "noOfStripes") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                                            />

                                                                                        </td> */}


                                                                                        <td className="h-[30px]   border-blue-gray-200 text-[11px] text-right ">
                                                                                            <input className='text-right w-full p-1.5 border-gray-200 '
                                                                                                type="number"
                                                                                                value={item?.qty}
                                                                                                onChange={(e) => { handleInputChange(e.target.value, index, "qty") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                                            />

                                                                                        </td>

                                                                                        <td className=" text-center border-blue-gray-200 text-[11px] ">
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

                                                                                    <td className="  w-10 text-right pr-1">{orderDetails.reduce((a, c) => a + parseFloat(c.orderQty || 0), 0)}</td>
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
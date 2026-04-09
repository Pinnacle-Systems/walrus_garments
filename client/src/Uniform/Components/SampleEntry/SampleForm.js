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
import { getCommonParams, renameFile } from "../../../Utils/helper";
import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "./PrintFormat-OR";
import tw from "../../../Utils/tailwind-react-pdf";
import { packingCover, sampleUpdateStage } from "../../../Utils/DropdownData";
import { Loader } from "../../../Basic/components";
import { RiPlayListAddLine } from "react-icons/ri";
import { CLOSE_ICON, DELETE, VIEW } from "../../../icons";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";
import { useGetSocksTypeQuery } from "../../../redux/uniformService/SocksTypeMasterService";
import { useGetYarnNeedleMasterQuery } from "../../../redux/uniformService/YarnNeedleMasterservices";
import { useGetFiberContentMasterQuery } from "../../../redux/uniformService/FiberContentMasterServices";
import { getImageUrlPath } from "../../../helper";
import { useGetMachineQuery } from "../../../redux/services/MachineMasterService";


const MODEL = "Order";

const SampleForm = ({ orderDetails, setOrderDetails, readOnly, setReadOnly, setId, id, onClose }) => {


    const [isForOrderImportItems, setIsForOrderImportItems] = useState(false)
    const [docId, setDocId] = useState("")

    const [formReport, setFormReport] = useState(false);
    const [active, setActive] = useState(true);

    const [validDate, setValidDate] = useState()

    const [tempOrderDetails, setTempOrderDetails] = useState([]);
    const [phone, setPhone] = useState()
    const [address, setAddress] = useState()
    const [contactPersonName, setContactPersonName] = useState("");

    const [partyId, setPartyId] = useState("");
    const [date, setDate] = useState("");
    const childRecord = useRef(0);
    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const [printModalOpen, setPrintModalOpen] = useState(false)
    const [packingCoverType, setPackingCoverType] = useState("")
    const [loading, setLoading] = useState(false);



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
    const { data: Yarnlist } = useGetYarnNeedleMasterQuery({ params: { ...params } });
    const { data: machineList } = useGetMachineQuery({ params: { ...params } });
    const { data: fiberContent } = useGetFiberContentMasterQuery({ params: { ...params } });

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


    const { data: singleSupplier, isLoading: isSingleSupplierLoading, isFetching: isSingleSupplierFetching } =
        useGetPartyByIdQuery(partyId, { skip: !partyId });


    console.log(singleData, "singggg")

    const syncFormWithDb = useCallback((data) => {
        if (id) {
            setReadOnly(readOnly ? readOnly : false);
        }

        if (data?.docId) {
            setDocId(data?.docId)
        }

        setDate(data?.createdAt ? moment(data?.createdAt).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD"));
        setPartyId(data?.partyId ? data?.partyId : "");
        setContactPersonName(data?.contactPersonName ? data?.contactPersonName : "")
        setPhone(data?.phone ? data?.phone : "");
        setAddress(data?.address ? data?.address : "");
        setValidDate(data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : "");
        setOrderDetails(data?.orderDetails ? data?.orderDetails : []);
        setPackingCoverType(data?.packingCoverType ? data?.packingCoverType : "");

    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        branchId, id, userId, companyId,
        packingCoverType,
        active,
        partyId, finYearId, phone, contactPersonName, address, validDate, orderDetails: orderDetails?.filter(j => j.styleId && j.socksMaterialId && j.socksTypeId && j.qty)
    }

    const validateData = (data) => {

        if (orderDetails?.length > 0 && data.partyId) {
            return true
        }

        return false
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            const formData = new FormData();
            for (let key in data) {
                if (key === 'orderDetails') {
                    formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? i.filePath.name : i.filePath }))));
                    data[key].forEach(option => {
                        if (option?.filePath instanceof File) {
                            formData.append('images', option.filePath);
                        }
                    });
                } else {
                    formData.append(key, data[key]);
                }
            }

            let returnData;
            if (text === "Updated") {
                console.log(formData, "formData")
                returnData = await callback({ id, body: formData }).unwrap();
            } else {
                returnData = await callback(formData).unwrap();
            }
            if (returnData.statusCode === 0) {
                setId(returnData?.data?.id);
                syncFormWithDb(undefined);
                toast.success(text + "Successfully");
            } else {
                toast.error(returnData?.message);
            }

        } catch (error) {
            console.log("handle", error);
        }
    };


    // const handleSubmitCustom = async (callback, data, text) => {
    //     try {
    //         let returnData = await callback(data).unwrap();
    //         if (returnData.statusCode === 0) {

    //             setId("")
    //             syncFormWithDb(undefined)
    //             toast.success(text + "Successfully");
    //         } else {
    //             toast.error(returnData?.message)
    //         }
    //     } catch (error) {
    //         console.log("handle")
    //     }
    // }


    const saveData = () => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" })
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            console.log(id, "ididi")
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    }

    // const deleteData = async () => {
    //     if (id) {
    //         if (!window.confirm("Are you sure to delete...?")) {
    //             return;
    //         }
    //         try {
    //             await removeData(id)
    //             setId("");
    //             onNew();
    //             toast.success("Deleted Successfully");
    //         } catch (error) {
    //             toast.error("something went wrong");
    //         }
    //     }
    // };

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
                yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
                measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
                stripecolorId: "", design: "", noOfStripes: "0", qty: "0", socksTypeId: "",
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
                    yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
                    measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
                    stripecolorId: "", noOfStripes: "0", qty: "0", socksTypeId: "",
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



    function openPreview(filePath) {
        window.open(filePath instanceof File ? URL.createObjectURL(filePath) : getImageUrlPath(filePath))
    }

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
                className="md:items-start md:justify-items-center  bg-theme h-[800px]  overflow-auto">


                {/* <Modal
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
                </Modal> */}


                <div className="flex flex-col frame w-full ">
                    <div className="bg-gray-700">
                        <FormHeader
                            // onNew={onNew}
                            model={MODEL}
                            onClose={() => onClose()}
                            saveData={saveData}
                            setReadOnly={setReadOnly}
                            // deleteData={deleteData}
                            // openReport={() => { setFormReport(true) }}
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
                                            <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-200 p-1 h-[25vh]'>
                                                <legend className='sub-heading'>Order Info</legend>
                                                <div className='flex flex-col justify-center items-start flex-1 w-full'>
                                                    <div className="grid grid-cols-4 gap-x-2 w-full">
                                                        <DisabledInput name="Doc Id." value={docId} required={true} />
                                                        <DisabledInput name="Order Date" value={date} type={"date"} required={true} readOnly={true} disabled inputClass={"w-60"} />
                                                        <DateInput name="Delivery.Date" value={validDate} setValue={setValidDate} readOnly={readOnly} inputClass={"w-60"} />
                                                        <DropdownInput name="Customer" options={dropDownListObject((supplierList?.data || []), "name", "id")} value={partyId} setValue={setPartyId} required={true} readOnly={readOnly} />
                                                        {/* <DropdownInput name="Socks Material" options={dropDownListObject((socksMaterialData?.data || []), "name", "id")} value={socksMaterial} setValue={setSocksMaterial} required={true} readOnly={readOnly} />
                                                        <DropdownInput name="Socks Type" options={dropDownListObject((socksTypeData?.data || []), "name", "id")} value={socksType} setValue={setSocksType} required={true} readOnly={readOnly} /> */}
                                                        <DropdownInput name="Packing.Cover" options={packingCover} value={packingCoverType} setValue={setPackingCoverType} required={true} readOnly={readOnly} />

                                                        {/* <DropdownInput name="Leg Color" options={dropDownListObject((colorlist?.data || []), "name", "id")} value={legColor} setValue={setLegColor} required={true} readOnly={readOnly} />
                                                        <DropdownInput name="Foot Color" options={dropDownListObject((colorlist?.data || []), "name", "id")} value={footColor} setValue={setFootColor} required={true} readOnly={readOnly} />
                                                        <DropdownInput name="Stripe Color" options={dropDownListObject((colorlist?.data || []), "name", "id")} value={stripeColor} setValue={setStripeColor} required={true} readOnly={readOnly} />
                                                        <TextInput name="NoOfStripes" className={"w-60"} type="text" value={noOfStripes} setValue={setNoOfStripes} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} /> */}
                                                        {/* <TextInput name="LogoName" type="text" value={name} setValue={setName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} /> */}


                                                        <TextInput name="Con.Person.Name" className={"w-60"} type="text" value={contactPersonName} setValue={setContactPersonName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />

                                                        <TextInput name="Phone No" className={"w-60"} type="text" value={phone} setValue={setPhone} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                        <TextInput name=" Billing Address" className={"w-60"} type="text" value={address} setValue={setAddress} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                                        {/* <div className="col-span-5 flex justify-start mt-1">

                                                            <CheckBox name="Name/Logo" readOnly={readOnly} value={isLogo} setValue={setIsLogo} />
                                                        </div> */}
                                                        {/* <TextInput name="LogoName" className={"w-60"} type="text" value={name} setValue={setName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} /> */}

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
                                                                <div className="h-[60vh] overflow-x-auto overflow-y-auto">

                                                                    <table className="border border-gray-500 table-auto w-full">
                                                                        <thead className="border border-gray-500">
                                                                            <tr className=" bg-gray-400">
                                                                                <th className=" border border-gray-500 text-sm px-1 py-0.5 w-7 text-center p-0.5">S.No</th>
                                                                                <th className="px-0.5 py-0.5 w-24 border border-gray-500 text-sm">Style</th>
                                                                                <th className="px-0.5 py-0.5 w-40  border border-gray-500 text-sm">Image</th>
                                                                                <th className="px-0.5 py-0.5 w-32  border border-gray-500 text-sm">Needle</th>
                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">Machine</th>
                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">Fab.Content</th>
                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">Desc</th>
                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">Material</th>
                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">Socks.Type</th>
                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">Leg.col</th>
                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">Foot.col</th>
                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">Stripe.col</th>
                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">N.Stripe</th>

                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">Size</th>
                                                                                <th className="px-0.5 py-0.5  border border-gray-500 text-sm">S.Mea</th>


                                                                                <th className="px-0.5 py-0.5  w-12 border border-gray-500 text-sm">Qty</th>
                                                                                <th className="px-0.5 py-0.5  w-12 border border-gray-500 text-sm">Wt.socks</th>

                                                                                <th className="tx-table-cell  w-7 p-0.5 border border-gray-500 text-sm" >
                                                                                    <button className='text-2xl' onClick={addNewRow}>+</button>
                                                                                </th>

                                                                            </tr>
                                                                        </thead>

                                                                        <tbody className="text-blue-gray-900 ">{console.log("orderDetails", orderDetails)}
                                                                            {(orderDetails ? orderDetails : []).map((item, index) =>
                                                                                <tr className="border border-blue-gray-200 cursor-pointer " >
                                                                                    <td className=" border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
                                                                                    <td className="    border border-gray-300 text-[11px] w-20">
                                                                                        <select
                                                                                            disabled={readOnly}
                                                                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "styleId") } }}
                                                                                            className='text-left w-full rounded py-1 h-full'
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



                                                                                    <td className="py-0.5 px-3 border border-gray-300 w-16 overflow-x-auto">
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

                                                                                    <td className=" w-16  border border-gray-300 text-[11px] ">
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

                                                                                    <td className=" w-24  border border-gray-300 text-[11px] ">
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
                                                                                    <td className=" w-24 border border-gray-300 text-[11px] ">
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
                                                                                    <td className="tx-table-cell w-24 text-left px-1 py-1 text-xs border border-gray-300">
                                                                                        <textarea readOnly={readOnly} className=" w-full overflow-auto focus:outline-none  rounded text-xs"
                                                                                            value={item.description}
                                                                                            onChange={(e) => handleInputChange(e.target.value, index, "description")}

                                                                                        >
                                                                                        </textarea>

                                                                                    </td>
                                                                                    <td className=" w-24 border border-gray-300 text-[11px] ">
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
                                                                                    <td className=" w-24  border border-gray-300 text-[11px] ">
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
                                                                                    <td className="w-24  border border-gray-300 text-[11px] ">
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
                                                                                    <td className="w-24  border border-gray-300 text-[11px] ">
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
                                                                                    <td className=" w-24  border border-gray-300 text-[11px] ">
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
                                                                                    <td className="w-12  border border-gray-300 text-[11px] ">
                                                                                        <input className='text-right w-full h-full p-1.5 border-gray-200 '
                                                                                            type="number"
                                                                                            value={item?.noOfStripes || 0}
                                                                                            onChange={(e) => { handleInputChange(e.target.value, index, "noOfStripes") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                                        />

                                                                                    </td>


                                                                                    <td className=" w-16  border-blue-gray-200 text-[11px] border border-gray-300">
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
                                                                                    <td className="w-12  border border-gray-300 text-[11px] ">
                                                                                        <input className='text-right w-full h-full p-1.5 border-gray-200 '
                                                                                            type="text"
                                                                                            value={item?.measurements || 0}
                                                                                            onChange={(e) => { handleInputChange(e.target.value, index, "measurements") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                                        />

                                                                                    </td>


                                                                                    <td className=" border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                                                        <input className='text-right w-full p-1.5 '
                                                                                            type="number"
                                                                                            value={item?.qty}
                                                                                            onChange={(e) => { handleInputChange(e.target.value, index, "qty") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                                        />

                                                                                    </td>

                                                                                    <td className=" border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                                                        <input className='text-right w-full p-1.5 '
                                                                                            type="number"
                                                                                            value={item?.weightOfSocks}
                                                                                            onChange={(e) => { handleInputChange(e.target.value, index, "weightOfSocks") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                                        />

                                                                                    </td>

                                                                                    <td className=" text-center border-blue-gray-200 text-[11px] border border-gray-300">
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

                                                                            <tr className='w-full h-7 '>
                                                                                <td className="border border-gray-300 text-center w-10 font-bold" colSpan={15}>Total</td>
                                                                                <td className=" border border-gray-300 w-10 text-right pr-1">{orderDetails.reduce((a, c) => a + parseFloat(c.orderQty || 0), 0)}</td>
                                                                                <td className=" border border-gray-300 w-10 text-right pr-1"></td>
                                                                                <td className=" border border-gray-300 w-10 text-right pr-1"></td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>


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


export default SampleForm;
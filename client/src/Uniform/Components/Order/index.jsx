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
import { dropDownListObject, } from '../../../Utils/contructObject';

import Modal from "../../../UiComponents/Modal";
import FormReport from "./FormReport";

import moment from "moment";
import { getCommonParams } from "../../../Utils/helper";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StyleTypeHeading from "./StyleTypeHeading";
import PanelWiseProcess from "./PanelWiseProcess";
import { useGetItemMasterByIdQuery, useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "./PrintFormat-OR";
import tw from "../../../Utils/tailwind-react-pdf";


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
    const [itemId, setItemId] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const [printModalOpen, setPrintModalOpen] = useState(false)
    const params = {
        branchId, userId, finYearId
    };
    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });

    const { data: allData, isLoading, isFetching } = useGetOrderQuery({ params, searchParams: '' });
    const {
        data: itemData,

    } = useGetItemMasterByIdQuery(itemId, { skip: !itemId });

    const {
        data: itemList,
        isLoading: isItemListLoading,
        isFetching: isItemListFetching,
    } = useGetItemMasterQuery({ params });


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



    const orderDetailsSubGrid = orderDetails?.map(item => item.orderDetailsSubGrid)
    let classIds = [];

    orderDetailsSubGrid?.forEach(item =>
        item.forEach(cl => classIds.push(cl.classIds))
    )


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
        syncFormWithDb(undefined)
        getNextDocId();
    };


    useEffect(() => {
        if (id) return
        if (!singleSupplier?.data || isSingleSupplierLoading || isSingleSupplierFetching) return
        if (!partyId) return
        setPhone(singleSupplier?.data?.contactMobile ? singleSupplier?.data.contactMobile : "")
        setContactPersonName(singleSupplier?.data?.contactPersonName ? singleSupplier?.data.contactPersonName : "");
        setAddress(singleSupplier?.data?.address ? singleSupplier?.data.address : "");
    }, [setPhone, setContactPersonName, partyId, singleSupplier, isSingleSupplierLoading, isSingleSupplierFetching])


    const handleInputChange = (value, index, field) => {
        setOrderDetails(prev => {
            const newBlend = structuredClone(prev);
            newBlend[index][field] = value;
            return newBlend
        });
    };

    useEffect(() => {
        if (id) return
        if (noOfSet) return
        setOrderDetails(prev => {
            if (prev?.length >= 2) return prev
            let newArray = Array.from({ length: 2 - prev?.length }, i => {
                return {
                    itemTypeId: "", orderDetailsSubGrid: [{
                        uniformType: "",
                        classIds: [],
                        femaleColorsIds: [],
                        maleColorIds: [],
                        malePanelProcess: [],
                        feMalePanelProcess: [],
                        isMaleColorId: "",
                        noOfSetMale: "",
                        noOfSetFemale: "",
                        isFemaleColorId: "",
                        isMaleItemId: "",
                        isFemaleItemId: "",
                        qty: ""
                    }]
                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setOrderDetails, id, orderDetails])



    useEffect(() => {
        if (!noOfSet) return
        if (id) return
        setOrderDetails((prev) => {
            let newObj = structuredClone(prev)
            newObj = newObj.map((item, itemIndex) => {
                return {
                    ...item,
                    orderDetailsSubGrid: item.orderDetailsSubGrid?.map(val => {
                        return {
                            ...val, noOfSetMale: noOfSet, noOfSetFemale: noOfSet
                        }
                    })
                }
            })

            return newObj
        })


    }, [noOfSet, id])

    useEffect(() => {
        let newObj = {};
        let tempArray = []
        singleData?.data?.orderDetails?.forEach((item, itemIndex) => {
            item?.orderDetailsSubGrid?.forEach((val, valIndex) => {
                console.log(val, "val")
                newObj = {
                    itemType: item?.ItemType?.name,
                    typeOfUniform: val?.uniformType,
                    // classIds:val?.classIds?.map(v=>v.Class?.name)?.join(","),
                    classIds: `${val?.classIds[0]?.Class?.name} ${"-"} ${val?.classIds?.[val?.classIds?.length - 1]?.Class?.name}`,
                    maleItem: val?.isMaleStyle?.name,
                    maleColor: val?.isMaleColor?.name,
                    maleSet: val?.noOfSetMale,
                    maleColorIds: val?.
                        maleColorIds?.map(item => item?.Color?.name).join(","),
                    femaleItem: val?.isFemaleStyle?.name,
                    femaleColor: val?.isFemaleColor?.name,
                    femaleSet: val?.noOfSetFemale,
                    femaleColorsIds: val?.femaleColorsIds?.map(item => item?.Color?.name).join(",")
                }
            })
            tempArray.push(newObj)
        })
        setTempOrderDetails(tempArray)
    }, [singleData, setTempOrderDetails])


    // console.log(tempOrderDetails,"tempOrderDetails")

    //  useEffect(() => {
    //         if (id) return
    //         if (!itemId) return

    //         if (value?.[arrayName]?.length > 0) return
    //         itemData?.data?.ItemPanel?.forEach((panel, panelIndex) => {
    //             setOrderDetails((prev) => {
    //                 const updatedPanelData = [...prev];
    //                 updatedPanelData[index]["orderDetailsSubGrid"]?.[currentSelectedIndex]?.[arrayName]?.push({
    //                     panelId: panel.panelId,
    //                     selectedAddons: []
    //                 })
    //                 return updatedPanelData;
    //             });
    //         })

    //     }, [arrayName, itemTypeId, itemId, itemData])

    const handleInputChangeOrderDetails = (value, index, valueIndex, field) => {

        setOrderDetails(prev => {
            const newBlend = structuredClone(prev);
            newBlend[index]["orderDetailsSubGrid"][valueIndex][field] = value;

            if (field === "isMaleItemId") {

                let itemData = itemList?.data?.find(val => parseInt(val.id) == parseInt(value))


                let panelProcess = itemData?.ItemPanel?.map((panel, panelIndex) => {
                    return {
                        panelId: panel.panelId,
                        selectedAddons: []
                    }
                })
                newBlend[index]["orderDetailsSubGrid"][valueIndex]["malePanelProcess"] = panelProcess
            }
            if (field === "isFemaleItemId") {

                let itemData = itemList?.data?.find(val => parseInt(val.id) == parseInt(value))


                let panelProcess = itemData?.ItemPanel?.map((panel, panelIndex) => {
                    return {
                        panelId: panel.panelId,
                        selectedAddons: []
                    }
                })
                newBlend[index]["orderDetailsSubGrid"][valueIndex]["feMalePanelProcess"] = panelProcess
            }
            return newBlend
        });

    };





    let supplierListBasedOnSupply = supplierList ? supplierList.data?.filter(val => val?.isBuyer) : []
    return (
        <>
            <div
                onKeyDown={handleKeyDown}
                className="md:items-start md:justify-items-center  bg-theme h-[800px]  overflow-auto ">

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
                    <div className="flex-1 grid gap-x-2">
                        <div className="col-span-3 grid ">
                            <div className='col-span-3 grid '>
                                <div className='mr-1'>
                                    <div className={`grid`}>
                                        <div className={"flex flex-col"}>
                                            <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 p-1'>
                                                <legend className='sub-heading'>Order Info</legend>
                                                <div className='flex flex-col justify-center items-start flex-1 w-full'>
                                                    <div className="grid grid-cols-5 w-full">
                                                        <DisabledInput name="Doc Id." value={docId} required={true} />
                                                        <DateInput name="Doc Date" value={date} type={"date"} required={true} readOnly={readOnly} disabled />
                                                        <DropdownInput name="Customer" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={partyId} setValue={setPartyId} required={true} readOnly={readOnly} />
                                                        <TextInput name="Phone No" type="text" value={phone} setValue={setPhone} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                        <TextInput name="Con.Person.Name" type="text" value={contactPersonName} setValue={setContactPersonName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                                        <TextInput name="Address" type="text" value={address} setValue={setAddress} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                                        {/* <TextInput name="Order.Qty" type="text" value={orderQty} setValue={setOrderQty} readOnly={readOnly} disabled={(childRecord.current > 0)} /> */}
                                                        <TextInput name="No.Of.Set" type="number" value={noOfSet} setValue={setNoOfSet} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                                        <DateInput name="Delivery.Date" value={validDate} setValue={setValidDate} readOnly={readOnly} />
                                                        <CheckBox name="StudentList" readOnly={readOnly} value={isForOrderImportItems} setValue={setIsForOrderImportItems} />

                                                    </div>
                                                </div>
                                            </fieldset>
                                            <fieldset className={`frame my-1 grid grid-cols-4 `}>
                                                <legend className='sub-heading'>Order Info</legend>
                                                <div className=' grid col-span-4'>
                                                    <table className="border border-gray-500">
                                                        <thead className="border border-gray-500">
                                                            <tr className="">
                                                                <th className="border border-gray-500 text-sm p-1">S.No </th>
                                                                <th className="border border-gray-500 text-sm p-1">Type Of Uniform</th>
                                                                <th className="border border-gray-500 text-sm p-1 w-64">Class</th>
                                                                <th className="border border-gray-500 text-sm">
                                                                    <div className="flex flex-col gap-y-1">
                                                                        <span className="border-b-4">
                                                                            Male
                                                                        </span>
                                                                        <div className="grid grid-cols-5 w-full">
                                                                            <span className="border-r-2  col-span-2">
                                                                                Item
                                                                            </span>
                                                                            <span className="border-r-2 col-span-2">
                                                                                Color
                                                                            </span>
                                                                            <span>
                                                                                No.Of.Set
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </th>
                                                                <th className="border border-gray-500 text-sm ">
                                                                    <div className="flex flex-col gap-y-1">
                                                                        <span className="border-b-4">
                                                                            Female
                                                                        </span>
                                                                        <div className="grid grid-cols-5 w-full">
                                                                            <span className="border-r-2  col-span-2">
                                                                                Item
                                                                            </span>
                                                                            <span className="border-r-2 col-span-2">
                                                                                Color
                                                                            </span>
                                                                            <span>
                                                                                No.Of.Set
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </th>

                                                                <th className="border border-gray-500 text-sm p-1" colSpan={2}>
                                                                    <button type='button' className="text-green-700" onClick={() => {
                                                                        setOrderDetails(prev => {
                                                                            let newPrev = structuredClone(prev);
                                                                            newPrev.push({
                                                                                itemTypeId: "",
                                                                                orderDetailsSubGrid: [
                                                                                    {
                                                                                        uniformType: "",
                                                                                        classIds: [],
                                                                                        femaleColorsIds: [],
                                                                                        maleColorIds: [],
                                                                                        malePanelProcess: [],
                                                                                        feMalePanelProcess: [],
                                                                                        isMaleItemId: "",
                                                                                        noOfSetMale: noOfSet,
                                                                                        noOfSetFemale: noOfSet,
                                                                                        isFemaleItemId: "",
                                                                                        isMaleColorId: "",
                                                                                        isFemaleColorId: "",
                                                                                        qty: ""
                                                                                    }
                                                                                ]
                                                                            })
                                                                            return newPrev
                                                                        })
                                                                    }}
                                                                        disabled={readOnly}
                                                                    > {<FontAwesomeIcon icon={faUserPlus} />}
                                                                    </button>
                                                                </th>
                                                            </tr>
                                                        </thead>{console.log(orderDetails, "orderDetails")}
                                                        <tbody>
                                                            {(orderDetails ? orderDetails : []).map((item, index) =>
                                                                <StyleTypeHeading params={params} key={index} index={index} noOfSet={noOfSet} orderDetails={orderDetails}
                                                                    item={item} handleInputChange={handleInputChange} handleInputChangeOrderDetails={handleInputChangeOrderDetails} readOnly={readOnly}
                                                                    childRecord={childRecord} setOrderDetails={setOrderDetails} id={id}
                                                                // setCurrentSelectedIndex={setCurrentSelectedIndex}
                                                                // setArrayName={setArrayName} setItemId={setItemId}

                                                                />
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </fieldset>
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
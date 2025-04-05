import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    useGetOrderImportQuery,
    useGetOrderImportByIdQuery,
    useAddOrderImportMutation,
    useUpdateOrderImportMutation,
    useDeleteOrderImportMutation,
} from "../../../redux/services/OrderImportService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DisabledInput, DateInput, DropdownInput } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';

import Modal from "../../../UiComponents/Modal";
import FormReport from "./FormReport";

import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";

import ExcelSelectionTable from "./ExcelSelectionTable";
import moment from "moment";
import OrderImportItems from "./OrderImportItems";
import OrderDropdown from "../../Components/ReusableComponents/OrderDropdown";
import { useGetOrderByIdQuery } from "../../../redux/uniformService/OrderService";
import StudentList from "./StudentList";
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetClassMasterQuery } from "../../../redux/uniformService/ClassMasterService";

const MODEL = "Order Import";

export default function Form() {

    const [readOnly, setReadOnly] = useState(false);
    const [docId, setDocId] = useState("")
    const [id, setId] = useState("");
    const [file, setFile] = useState(null);
    const [formReport, setFormReport] = useState(false);
    const [partyId, setPartyId] = useState("");
    const [date, setDate] = useState("");
    const [orderImportItems, setOrderImportItems] = useState([]);
    const [pres, setPres] = useState([]);
    const [additionalImportData, setAdditionalImportData] = useState([])
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState('');
    const [isDirectImportItems, setIsDirectImportItems] = useState(false)
    const childRecord = useRef(0);
    const { branchId, companyId, finYearId, userId } = getCommonParams()
    const params = {
        branchId, userId, finYearId
    };

    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });

    const { data: allData, isLoading, isFetching } = useGetOrderImportQuery({ params, searchParams: '' });

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
    } = useGetOrderImportByIdQuery(id, { skip: !id });

    const [addData] = useAddOrderImportMutation();
    const [updateData] = useUpdateOrderImportMutation();
    const [removeData] = useDeleteOrderImportMutation();





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
        setIsDirectImportItems(data?.isDirectImportItems ? data?.isDirectImportItems : false)
        setOrderId(data?.orderId || "");
        if (!data?.isDirectImportItems) {
            setOrderImportItems(data?.orderImportItems || []);
        }

        setAdditionalImportData(data?.additionalImportData || [])
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
        partyId, finYearId, orderId, additionalImportData: additionalImportData?.filter(j => j?.colorId && j?.gender && j?.itemId && j?.itemTypeId)?.map((j, index) => {
            return {
                ...j, qty: j?.classIds?.reduce((old, current) => {
                    return (parseFloat(old) + parseFloat(current?.qty ? current?.qty : 0))
                }, 0)
            }
        }),
        isDirectImportItems
    }



    const {
        data: orderData,
    } = useGetOrderByIdQuery(orderId, { skip: !orderId });


    const validateData = (data) => {
        let mandatoryFields = ["student_name",
            "class",
            "gender",
            "color",
            "bottomcolor",
            "size",
            "bottomsize"
        ];
        return data.partyId && data.orderId && isGridDatasValid(pres, false, mandatoryFields)
    }

    const handleSubmitCustom = async (callback, data, text) => {

        if (isDirectImportItems) {


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
        else {
            try {
                const formData = new FormData();

                for (let key in data) {
                    formData.append(key, data[key]);
                }
                if (file instanceof File) {
                    formData.append("file", file);
                }

                let returnData;
                if (text === "Updated") {
                    returnData = await callback(formData).unwrap();
                } else {

                    returnData = await callback(formData).unwrap();
                }
                if (returnData?.statusCode === 0) {
                    onNew()
                    setError("");
                    toast.success(text + "Successfully");
                } else if (returnData?.statusCode === 2) {

                    setError(returnData)
                } else {
                    toast.error(returnData?.message)
                }
            } catch (error) {
                console.log("handle");
            }
        }

    };

    const saveData = (isCreateMasters) => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" })
            return
        }
        if (id) {
            handleSubmitCustom(updateData, { ...data, isCreateMasters }, "Updated");
        } else {
            handleSubmitCustom(addData, { ...data, isCreateMasters }, "Added");
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
        setPres([]);
    };
    const { data: classList } =
        useGetClassMasterQuery({});



    useEffect(() => {


        if (!isDirectImportItems) return

        if (id) return;
        setAdditionalImportData((prev) => {
            if (prev.length >= 5) return prev;
            let newArray = Array.from({ length: 5 - prev.length }, (i) => {
                return {
                    itemTypeId: "",
                    itemId: "",
                    bottomSizeId: "",
                    sizeId: "",
                    colorId: "",
                    gender: "",
                    qty: "",
                    classIds: [{
                        classId: "",
                        qty: "",
                        sizeId: "",
                    }]

                };
            });
            return [...prev, ...newArray];
        });
    }, [setAdditionalImportData, id, additionalImportData, isDirectImportItems]);


    useEffect(() => {
        if (id) return

        console.log(orderData, "orderData")
        setIsDirectImportItems(orderData?.data?.isForOrderImportItems)
    }, [orderId, orderData, setIsDirectImportItems, id])



    let supplierListBasedOnSupply = supplierList ? supplierList.data : []
    return (
        <div
            onKeyDown={handleKeyDown}
            className="md:items-start md:justify-items-center grid h-full bg-theme overflow-auto">
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
            <Modal isOpen={error} onClose={() => setError('')} widthClass={"px-2 w-[500px] overflow-auto"}>
                <div className="w-full">
                    <div className="text-center font-bold ">{error?.message}</div>
                    {((error?.data?.missingItemsInClassMaster || [])?.length > 0) &&
                        <div className="flex gap-1 mt-1">
                            <span className="font-bold"> Class: </span>
                            <span> {(error?.data?.missingItemsInClassMaster || []).join(",")} </span>
                        </div>
                    }
                    {((error?.data?.missingItemsInSizeMaster || [])?.length > 0) &&
                        <div className="flex gap-1 mt-1">
                            <span className="font-bold"> Size: </span>
                            <span> {(error?.data?.missingItemsInSizeMaster || []).join(",")} </span>
                        </div>
                    }
                    {((error?.data?.missingItemsInBottomSizeMaster || [])?.length > 0) &&
                        <div className="flex gap-1 mt-1">
                            <span className="font-bold"> BottomSize: </span>
                            <span> {(error?.data?.missingItemsInBottomSizeMaster || []).join(",")} </span>
                        </div>
                    }
                    {((error?.data?.missingItemsInColorMaster || [])?.length > 0) &&
                        <div className="flex gap-1 mt-1">
                            <span className="font-bold"> Color: </span>
                            <span> {(error?.data?.missingItemsInColorMaster || []).join(",")} </span>
                        </div>
                    }
                    {((error?.data?.missingItemsInBottomColorMaster || [])?.length > 0) &&
                        <div className="flex gap-1 mt-1">
                            <span className="font-bold"> BottomColor: </span>
                            <span> {(error?.data?.missingItemsInBottomColorMaster || []).join(",")} </span>
                        </div>
                    }
                    <div className="w-full flex justify-around">
                        <button className="bg-red-500 text-white p-1 rounded-md" onClick={() => setError("")} >
                            Cancel
                        </button>
                        <button className="bg-blue-500 text-white p-1 rounded-md" onClick={() => saveData(true)}>
                            Auto Create Masters
                        </button>
                    </div>
                </div>
            </Modal>
            <div className="flex flex-col frame w-full h-full">
                <FormHeader
                    onNew={onNew}
                    model={MODEL}
                    saveData={saveData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                    openReport={() => { setFormReport(true) }}
                    childRecord={childRecord.current}
                />
                <div className="flex-1 grid gap-x-2">
                    <div className="col-span-3 grid ">
                        <div className='col-span-3 grid '>
                            <div className='mr-1'>
                                <div className={`grid`}>
                                    <div className={"flex flex-col"}>
                                        <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 px-3 min-h-[100px]'>
                                            <legend className='sub-heading'>Purchase Info</legend>
                                            <div className='flex flex-col justify-center items-start flex-1 w-full'>
                                                <div className="grid grid-cols-5 w-full">
                                                    <DisabledInput name="Doc Id." value={docId} required={true}
                                                    />
                                                    <DateInput name="Doc Date" value={date} type={"date"} required={true} readOnly={readOnly} disabled />
                                                    <DropdownInput name="Customer" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={partyId} setValue={setPartyId} required={true} readOnly={id} />
                                                    <OrderDropdown name={"Order"} readOnly={readOnly || !partyId} selected={orderId} setSelected={setOrderId} partyId={partyId} />
                                                </div>
                                            </div>
                                        </fieldset>

                                        {isDirectImportItems ?
                                            <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-600 md:pb-5 flex flex-1 overflow-auto'>
                                                <StudentList setAdditionalImportData={setAdditionalImportData} additionalImportData={additionalImportData} allData={allData} readOnly={readOnly} />
                                            </fieldset>
                                            : <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-600 md:pb-5 flex flex-1 overflow-auto'>
                                                <legend className='sub-heading'>Import Details</legend>
                                                {id ?
                                                    <OrderImportItems orderImportItems={orderImportItems} />
                                                    :
                                                    <ExcelSelectionTable pres={pres} setPres={setPres} params={params} readOnly={readOnly} file={file} setFile={setFile} />
                                                }
                                            </fieldset>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
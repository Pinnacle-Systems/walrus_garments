import React, { useCallback, useEffect, useRef, useState } from 'react'

import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import { useAddCountsMasterMutation, useDeleteCountsMasterMutation, useGetCountsMasterByIdQuery, useGetCountsMasterQuery, useUpdateCountsMasterMutation } from '../../redux/uniformService/CountsMasterServices';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { DropdownInput, DropdownWithSearch, ReusableTable, TextInput, ToggleButton } from '../../Inputs';
import { ExcessToleranceType, OrderType, OverallOptions, QtyType, RoundOff, statusDropdown } from '../../Utils/DropdownData';
import { Check, Plus, Power } from 'lucide-react';
import Modal from '../../UiComponents/Modal';
import Swal from 'sweetalert2';
import { useAddExcessToleranceMutation, useDeleteExcessToleranceMutation, useGetExcessToleranceByIdQuery, useGetExcessToleranceItemsQuery, useGetExcessToleranceQuery, useLazyGetExcessToleranceItemsQuery, useUpdateExcessToleranceMutation } from '../../redux/services/ExcessToleranceServices';
import { useGetMaterialMasterQuery } from '../../redux/uniformService/MaterialMasterServices';
import { HiTrash } from 'react-icons/hi';
import { findFromList } from '../../Utils/helper';


export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [transaction, setTransaction] = useState("");
    const [orderType, setOrderType] = useState("");
    const [applyon, setApplyOn] = useState("");

    const [qty, setQty] = useState("");
    const [roundOfType, setRoundOfType] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [excessQty, setExcessQty] = useState("");
    const [tempId, setTempId] = useState('')
    const [bagweight, setBagWeight] = useState('')

    const [material, setMaterial] = useState("")
    const [materialId, setMaterialId] = useState("")
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({})
    const [excessType, setExcessType] = useState("")
    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);
    const formRef = useRef(null);
    const [toleranceItems, setToleranceItems] = useState([])





    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const { data: allData, isLoading, isFetching } = useGetExcessToleranceQuery({ params, searchParams: searchValue });
    const {

        data: materialData,
    } = useGetMaterialMasterQuery({ params });





    const [fetchExcessToleranceItems, { data: excessToleranceItems, isLoading: isExcessLoading, isFetching: isExcessFetching }] = useLazyGetExcessToleranceItemsQuery();

    useEffect(() => {
        setToleranceItems(excessToleranceItems?.data)
        setId(excessToleranceItems?.id)

    }, [isExcessFetching, isExcessLoading, excessToleranceItems]);


    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetExcessToleranceByIdQuery(id, { skip: !id });


    const [addData] = useAddExcessToleranceMutation();
    const [updateData] = useUpdateExcessToleranceMutation();
    const [removeData] = useDeleteExcessToleranceMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setTransaction("");
                setActive(id ? (data?.active) : true);


            } else {
                setMaterialId(data?.materialId ? data?.materialId : "");
                // setExcessType(data?.excessType ? data?.excessType : "")
                setToleranceItems(data?.ExcessToleranceItems ? data?.ExcessToleranceItems : [])
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    useEffect(() => {
        if (form && formRef.current) {
            const firstInput = formRef.current.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    }, [form]);

    const data = {
        id, materialId,
        excessType, toleranceItems
        , active, material: findFromList(materialId, materialData?.data, "name"),
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    console.log(toleranceItems, "toleranceItems")

    // const validateData = (data) => {
    //     if (data.transaction && data?.excessType) {
    //         return true;
    //     }
    //     return false;
    // }

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            // toast.success(text + "Successfully");
            Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",
                draggable: true,
                timer: 1000,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            if (nextProcess === "new") {
                syncFormWithDb(undefined);
                onNew();
            } else {
                setForm(false);
            }

        } catch (error) {
            console.log("handle");
        }
    };

    const saveData = (nextProcess) => {
        // if (!validateData(data)) {
        //     toast.error("Please fill all required fields...!", {
        //         position: "top-center",
        //     });
        //     Swal.fire({
        //         title: "Please fill all required fields...!",
        //         icon: "success",
        //         draggable: true,
        //         timer: 1000,
        //         showConfirmButton: false,
        //         didOpen: () => {
        //             Swal.showLoading();
        //         }
        //     });
        //     return;
        // }
        if (!window.confirm("Are you sure save the details ...?")) {
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, data, "Added", nextProcess);
        }
    };

    const deleteData = async (id) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    toast.error(deldata?.message)
                    return
                }
                setId("");
                // toast.success("Deleted Successfully");
                Swal.fire({
                    title: "Deleted" + "  " + "Successfully",
                    icon: "success",
                    draggable: true,
                    timer: 1000,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                setForm(false)
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
        setForm(true);
        setSearchValue("");
        syncFormWithDb(undefined);
        setReadOnly(false);
        setOrderType("")
        setExcessType("")
        setToleranceItems([])
        setRoundOfType('')
        setBagWeight("")
        setTempId("")
        setMaterialId("")
        setFrom("")
        setTo("")
        setExcessQty("")
        setQty("");
        setBagWeight("")


    };

    const emptyRecoreds = () => {
        setExcessType("");
        setOrderType("");
        setQty("");
        setRoundOfType("");
        setFrom("");
        setTo("");
        setBagWeight("")
        setExcessQty("")
        setApplyOn("")
    };





    useEffect(() => {
        if (!Array.isArray(toleranceItems)) return;
        if (toleranceItems.length >= 5) return;

        setToleranceItems(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];

            const newArray = Array.from(
                { length: 3 - safePrev.length },
                () => ({
                    qty: "",
                })
            );

            return [...safePrev, ...newArray];
        });

    }, [toleranceItems]);



    const columns = [
        {
            header: "S.No",
            accessor: (item, index) => index + 1,
            className: "font-medium text-gray-900 w-12  text-center",
        },

        {
            header: "Material",
            accessor: (item) => findFromList(item?.materialId, materialData?.data, "name"),
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-72",
        },

        // {
        //     header: "active",
        //     accessor: (item) => (item.active ? ACTIVE : INACTIVE),
        //     //   cellClass: () => "font-medium text-gray-900",
        //     className: "font-medium text-gray-900 text-center uppercase w-16",
        // },

    ];



    const handleInputChange = (value, index, field) => {

        console.log(value, "value")
        const newBlend = structuredClone(toleranceItems);


        newBlend[index][field] = value;
        setToleranceItems(newBlend);
    };




    const handleView = (id) => {
        setId(id);
        setForm(true);
        setReadOnly(true);
    };
    const handleEdit = (id) => {
        setId(id);
        setForm(true);
        setReadOnly(false);
    };

    const handleDone = () => {
        console.log(bagweight, "bagweight")

        if (!materialId && !excessType && !orderType && !qty && !roundOfType) {
            toast.error("Please fill all required fields...!", {
                position: "top-center",
            });
            return
        }
        else {

            const newRecord = {
                bagweight,
                materialId,
                excessType,
                orderType,
                qty,
                roundOfType,
                from,
                to,
                excessQty,
                material: findFromList(materialId, materialData?.data, "name"),
                tempId: Date.now(),
                applyon,
            };

            setToleranceItems(prevItems => {
                let newItems = structuredClone(prevItems);

                let index;
                console.log(tempId, "tempId", index)

                if (tempId) {
                    index = newItems?.findIndex(v => v?.tempId || v.id === tempId);
                } else {
                    index = newItems?.findIndex(v => v?.materialId === "");
                }
                if (index !== -1) {
                    newItems[index] = newRecord;
                }
                else {
                    newItems.push(newRecord);
                }
                return newItems;
            });

            emptyRecoreds();
        }
    };




    console.log(toleranceItems, "toleranceItems")



    const handleSelectRecord = (record) => {
        // Always clear before setting
        emptyRecoreds();

        // Now set new record safely
        if (!record) return;

        setMaterialId(record?.materialId ?? "");
        setExcessType(record?.excessType ?? "");
        setOrderType(record?.orderType ?? "");
        setQty(record?.qty ?? "");
        setRoundOfType(record?.roundOfType ?? "");
        setFrom(record?.from ?? "");
        setTo(record?.to ?? "");
        setExcessQty(record?.excessQty ?? "");
        setTempId(record?.tempId ?? record?.id ?? "");
        setBagWeight(record?.bagWeight ?? record?.bagweight ?? "");
        setApplyOn(record?.applyon ? record?.applyon : "")
    };

    const deleteRow = (id) => {
        setToleranceItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };


    return (

        <div onKeyDown={handleKeyDown} className="p-1 h-[90%]">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-2xl font-bold text-gray-800">Excess Tolerance Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setForm(true);
                            onNew();
                        }}
                        className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New Excess Tolerance
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3 ">
                <ReusableTable
                    columns={columns}
                    data={allData?.data}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={deleteData}
                    itemsPerPage={15}
                />
            </div>

            <div>
                {form === true && (
                    <Modal
                        isOpen={form}
                        form={form}
                        widthClass={"w-[90%] h-[90%]"}
                        onClose={() => {
                            setForm(false);
                            setErrors({});
                        }}
                    >
                        <div className="h-full flex flex-col bg-gray-200">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Excess Tolerance "
                                                : "Counts Excess Tolerance "
                                            : "Add New Excess Tolerance"}
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <div>
                                        {readOnly && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setForm(false);
                                                    setSearchValue("");
                                                    setId(false);
                                                    onNew()
                                                    emptyRecoreds()
                                                }}
                                                className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!readOnly && (
                                            <button
                                                type="button"
                                                onClick={() => saveData("close")}
                                                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600
                                  border border-green-600 flex items-center gap-1 text-xs"
                                            >
                                                <Check size={14} />
                                                {id ? "Update" : "Save & close"}
                                            </button>
                                        )}
                                        {(!readOnly && !id) && (
                                            <button type="button" onClick={() => saveData("new")}
                                                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs">
                                                <Check size={14} />Save & New
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>


                            <div className='flex-1 overflow-auto p-3 space-y-3 '>
                                <div className='grid grid-cols-8 gap-3 bg-white px-2' ref={formRef}>
                                    <div className='mb-3'>
                                        <DropdownWithSearch
                                            label="Material"
                                            labelField={"name"}
                                            options={materialData?.data} type="text" value={materialId}
                                            setValue={(value) => {
                                                setMaterialId(value)
                                                // setId()
                                                // fetchExcessToleranceItems({ params: { materialId: value } });
                                            }}
                                            required={true} readOnly={readOnly} disabled={excessType}

                                        />
                                    </div>
                                    <div className=' '>
                                        <DropdownInput name="Transaction Type" options={ExcessToleranceType} value={excessType}
                                            // setValue={setExcessType}
                                            setValue={(value) => {
                                                setExcessType(value)
                                                // setId()
                                                // fetchExcessToleranceItems({ params: { materialId, excessType: value } });
                                            }}

                                            required={true} readOnly={readOnly} disabled={orderType || !materialId} />
                                    </div>



                                    <div className='mb-3'>
                                        <DropdownInput name="Order Type" type="text" options={OrderType} value={orderType}
                                            setValue={setOrderType} required={true} readOnly={readOnly} />
                                    </div>

                                    <div className='mb-3'>
                                        <DropdownInput name="Apply On" type="text " options={OverallOptions} value={applyon}
                                            // setValue={setApplyOn}
                                            setValue={(value) => {
                                                setApplyOn(value)
                                                // setId()
                                                fetchExcessToleranceItems({ params: { materialId, excessType, orderType, applyon: value } });
                                            }}

                                            required={true} readOnly={readOnly} />
                                    </div>

                                    <div className='mb-3'>
                                        <DropdownInput name="Qty Type" type="text " options={QtyType} value={qty}
                                            setValue={(value) => {
                                                setQty(value)
                                                setRoundOfType("")
                                                setBagWeight("")
                                            }}
                                            required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    </div>


                                    {/* 
                                    <div className='mb-3'>
                                        <DropdownInput name="Round Of" type="text" disabled={qty !== "ROUNDOFF"} options={RoundOff} value={roundOfType} setValue={setRoundOfType} required={true} readOnly={readOnly} />
                                    </div>
                                    <div className='mb-3'>
                                        <TextInput name="Bag Weight" type="text" disabled={roundOfType !== "BAG"} value={bagweight} setValue={setBagWeight} required={true} readOnly={readOnly} />
                                    </div> */}

                                    <div className='mb-3'>
                                        <TextInput name="From" type="text" value={from} setValue={setFrom} required={true} readOnly={readOnly} disabled={roundOfType === "BAG" || applyon == "APPLYOVERALL"} />
                                    </div>
                                    <div className='mb-3'>
                                        <TextInput name="To" type="text " value={to} setValue={setTo} required={true} readOnly={readOnly} disabled={roundOfType === "BAG" || applyon == "APPLYOVERALL"} />
                                    </div>

                                    <div className='mb-3'>

                                        <TextInput name="Excess" type="text " value={excessQty} setValue={setExcessQty} required={true} readOnly={readOnly} disabled={qty === "BAG"} />
                                    </div>




                                    <div className="flex justify-start h-8 gap-4">

                                        <div className="flex gap-2  h-6">
                                            <button
                                                type="button"
                                                onClick={handleDone}
                                                className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                                                     border border-blue-600 flex items-center gap-1 text-xs"
                                            >
                                                add

                                            </button>
                                        </div>
                                        <div className="flex gap-2 h-6">
                                            <button
                                                type="button"
                                                onClick={emptyRecoreds}
                                                className="px-3 py-1 hover:bg-red-600 hover:text-white rounded text-red-600 
                                                     border border-red-600 flex items-center gap-1 text-xs"
                                            >
                                                New

                                            </button>
                                        </div>
                                    </div>


                                </div>
                                <div className=''>
                                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[340px] ">
                                        <div className="flex justify-between items-center mb-2">
                                            <h2 className="font-bold text-slate-700">List Of Items</h2>
                                        </div>

                                        <div className="relative w-[90%] py-1">
                                            <table className="w-full border-collapse table-fixed">
                                                <thead className="bg-gray-200 text-gray-900 block">
                                                    <tr className="flex w-full">
                                                        <th className="w-7 px-2 py-2 text-center font-medium text-[13px]">S.No</th>
                                                        <th className="w-36 px-2 py-2 text-center font-medium text-[13px]">Material</th>
                                                        <th className="w-36 px-2 py-2 text-center font-medium text-[13px]">Transaction Type</th>
                                                        <th className="w-36 px-2 py-2 text-center font-medium text-[13px]">OrderType</th>
                                                        <th className="w-36 px-2 py-2 text-center font-medium text-[13px]">ApplyOn</th>
                                                        <th className="w-36 px-2 py-2 text-center font-medium text-[13px]">Qty Type</th>
                                                        <th className="w-36 px-2 py-2 text-center font-medium text-[13px]">From</th>
                                                        <th className="w-36 px-2 py-2 text-center font-medium text-[13px]">To</th>
                                                        <th className="w-36 px-2 py-2 text-center font-medium text-[13px]">Excess</th>
                                                        <th className="w-36 px-2 py-2 text-center font-medium text-[13px]">Active</th>
                                                        <th className="w-12 px-2 py-2"></th>
                                                    </tr>
                                                </thead>

                                                <tbody className=" max-h-[250px] overflow-y-auto w-full">
                                                    {(toleranceItems ? toleranceItems : [])?.map((row, index) => (
                                                        <tr
                                                            key={index}
                                                            className="flex w-full border-b border-gray-300 cursor-pointer"
                                                            onClick={() => {
                                                                emptyRecoreds();
                                                                setBagWeight()
                                                                handleSelectRecord(row, row?.tempId);
                                                            }}
                                                        >
                                                            <td className=" border border-gray-300 text-[11px] text-left py-1.5 px-2 ">
                                                                {index + 1}

                                                            </td>

                                                            <td className="w-36 border border-gray-300 text-[11px] text-left py-1.5 px-2">

                                                                {findFromList(row.materialId, materialData?.data, "name")}
                                                            </td>

                                                            <td className="w-36 border border-gray-300 text-[11px] text-left py-1.5 px-2">
                                                                {row.excessType}

                                                            </td>

                                                            <td className="w-36 border border-gray-300 text-[11px] text-left py-1.5 px-2r">{row?.orderType}</td>

                                                            <td className="w-36 border border-gray-300 text-[11px] text-left py-1.5 px-2">{row?.applyon}</td>

                                                            <td className="w-36 border border-gray-300 text-[11px] text-left py-1.5 px-2">{row?.qty}</td>

                                                            {/* <td className="w-36 border border-gray-300 text-[11px] text-left py-2.5 px-2">{row?.roundOfType}</td>

                                                            <td className="w-36 border border-gray-300 text-[11px] text-left py-2.5 px-2">
                                                                {parseFloat(row?.bagweight || 0).toFixed(3)}
                                                            </td> */}

                                                            <td className="w-36 border border-gray-300 text-[11px] text-left py-1.5 px-2">{parseFloat(row?.from || 0).toFixed(3)}</td>
                                                            <td className="w-36 border border-gray-300 text-[11px] text-left py-1.5 px-2">{parseFloat(row?.to || 0).toFixed(3)}</td>


                                                            <td className="w-36 border border-gray-300 text-[11px] text-left py-1.5 px-2">
                                                                {parseFloat(row?.excessQty || 0).toFixed(3)}
                                                            </td>

                                                            <td className="w-36 border border-gray-300 text-[11px]  py-1.5 px-2 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={row.active}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        handleInputChange(e.target.checked, index, "active");
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="w-12 border border-gray-300 text-[11px] text-left py-1.5 px-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteRow(index)

                                                                    }
                                                                    }
                                                                    className="text-red-600 hover:text-red-800 bg-red-50 py-1 rounded text-xs flex items-center justify-center"
                                                                >
                                                                    <HiTrash className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    )
}
























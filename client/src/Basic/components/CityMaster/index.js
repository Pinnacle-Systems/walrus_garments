import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetCityQuery,
    useGetCityByIdQuery,
    useAddCityMutation,
    useUpdateCityMutation,
    useDeleteCityMutation,
} from "../../../redux/services/CityMasterService";
import { useGetStateQuery } from "../../../redux/services/StateMasterService";

import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, DropdownInput, DisabledInput, ToggleButton, ReusableTable, TextInputNew1, DropdownInputNew } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import { dropDownListObject } from '../../../Utils/contructObject';
import Loader from "../Loader";
import { useDispatch } from "react-redux";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from '../MastersForm/MastersForm';
import { statusDropdown } from "../../../Utils/DropdownData";
import { useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setOpenPartyModal } from "../../../redux/features/openModel";
import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";
import Swal from "sweetalert2";
import { StateMaster } from "..";
const MODEL = "City Master";

export default function Form({ onSuccess, onClose, editId, deleteId, deleteLabel } = {}) {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState(editId || deleteId || "");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [active, setActive] = useState(true);
    const [state, setState] = useState("")

    const [searchValue, setSearchValue] = useState("");
    const nameRef = useRef(null);
    const formRef = useRef(null);
    const [errors, setErrors] = useState({});

    const childRecord = useRef(0);
    const dispatch = useDispatch();

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: stateList, isLoading: isStateLoading, isFetching: isStateFetching } = useGetStateQuery({ params });
    const { data: allData, isLoading, isFetching } = useGetCityQuery({ params, searchParams: searchValue });
    const lastTapName = useSelector((state) => state.party.lastTab)

    const openPartyModal = useSelector((state) => state.party.openPartyModal);

    useEffect(() => {
        if (openPartyModal) {
            setForm(true);
            setId('')
        }
    }, [openPartyModal]);
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetCityByIdQuery(id, { skip: !id });


    const [addData] = useAddCityMutation();
    const [updateData] = useUpdateCityMutation();
    const [removeData] = useDeleteCityMutation();

    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            // setReadOnly(false);
            setName("");
            setCode("");
            setActive(true);
            setState("");
            childRecord.current = 0;
        } else {
            // setReadOnly(true);
            setName(data?.name || "");
            setCode(data?.code || "");
            setActive(data?.active ? data?.active : true);
            setState(data?.stateId || "");
            childRecord.current = data?.childRecord ? data.childRecord : 0;
        }
    }, [id]);


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        name, code, active, state, id
    };

    const validateData = (data) => {
        if (data.name && data?.state) {
            return true;
        }
        return false;
    };
    const onNew = () => {
        setId("");
        setReadOnly(false);
        setForm(true);
        setSearchValue("");
        setTimeout(() => {
            nameRef.current?.focus();
        }, 100);
    };

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id);
            if (onSuccess) {
                onSuccess(returnData.data.id);
                return;
            }
            await Swal.fire({
                title: text + "Successfully",
                icon: "success",
            });
            if (nextProcess == "new") {
                syncFormWithDb(undefined)
                onNew()
            } else {
                setForm(false)
            }
            dispatch({
                type: `StateMaster/invalidateTags`,
                payload: ['State'],
            });

        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Submission error',
                text: error.data?.message || 'Something went wrong!',
            });
            nameRef.current?.focus();
        }
    };


    const saveData = (nextProcess) => {
        if (readOnly) return toast.info("Turn On Edit Mode !..")

        const upperName = name.toUpperCase();
        const upperCode = code.toUpperCase();

        const finalData = {
            ...data,
            name: upperName,
            code: upperCode
        };

        if (!validateData(finalData)) {
            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "error",
            });
            nameRef.current?.focus();
            return;
        }
        let foundItem;
        if (id) {
            foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item.name.toUpperCase() === upperName);
        } else {
            foundItem = allData?.data?.some(item => item.name.toUpperCase() === upperName);

        }
        if (foundItem) {
            Swal.fire({
                text: "The City Name already exists.",
                icon: "warning",
            });
            nameRef.current?.focus();
            return false;
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, finalData, "Added", nextProcess);
        }
    };
    const saveExitData = () => {
        if (readOnly) return toast.info("Turn On Edit Mode !..")

        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", {
                position: "top-center",
            });
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated", true);
        } else {
            console.log("hit");
            handleSubmitCustom(addData, data, "Added", true);
        }
    };

    const deleteData = async (id) => {

        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
                setId("");
                dispatch({
                    type: `countryMaster/invalidateTags`,
                    payload: ['Countries'],
                });
                await Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",
                });
                setForm(false);
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Submission error',
                    text: error.data?.message || 'Something went wrong!',
                });
                setForm(false);
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




    function countryFromState() {
        return state ? stateList.data.find(item => item.id === parseInt(state)).country?.name : ""
    }

    const handleView = (id) => {
        setId(id);
        setForm(true);
        setReadOnly(true);
        console.log("view");
    };
    const handleEdit = (id) => {
        setId(id);
        setForm(true);
        setReadOnly(false);
        console.log("Edit");
    };


    const ACTIVE = (
        <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
            <Power size={10} />
        </div>
    );

    const INACTIVE = (
        <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
            <Power size={10} />
        </div>
    );


    const columns = [
        {
            header: "S.No",
            accessor: (item, index) => index + 1,
            className: "font-medium text-gray-900 w-12  text-center",
        },
        {
            header: "City Name",
            accessor: (item) => item?.name,
            className: "font-medium text-gray-900 text-left uppercase w-64",
        },
        {
            header: "State Name",
            accessor: (item) => item?.state?.name,
            className: "font-medium text-gray-900 text-left uppercase w-64",
        },
        {
            header: "Country Name",
            accessor: (item) => item?.state?.country?.name,
            className: "font-medium text-gray-900 text-left uppercase w-64",
        },

        {
            header: "Status",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },

    ];
    const countryNameRef = useRef(null);

    useEffect(() => {
        if ((form || onSuccess) && nameRef.current) {
            nameRef.current.focus();
        }
    }, [form, onSuccess]);

    const formBody = (
        <div className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-1 gap-3 h-full">
                <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                    <div className="grid grid-cols-2 gap-3" ref={formRef}>
                        <div>
                            <TextInputNew1
                                ref={nameRef}
                                name="City Name"
                                type="text"
                                value={name}
                                setValue={setName}
                                required={true}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                            />
                        </div>
                        <div>
                            <TextInputNew1
                                name="Code"
                                type="text"
                                value={code}
                                setValue={setCode}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                            />
                        </div>
                        <div>
                            <DropdownInputNew
                                name="State"
                                options={
                                    Array.isArray(stateList?.data)
                                        ? dropDownListObject(
                                            id
                                                ? stateList?.data
                                                : stateList?.data?.filter((item) => item?.active),
                                            "name",
                                            "id"
                                        )
                                        : []
                                }
                                value={state}
                                setValue={setState}
                                required={true}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                addNewLabel="+ Add New State"
                                childComponent={StateMaster}
                                addNewModalWidth="w-[40%] h-[45%]"
                            />
                        </div>
                        <div>
                            <TextInputNew1
                                name="Country"
                                type="text"
                                value={countryFromState()}
                                disabled={true}
                            />
                        </div>
                        <div>
                            <ToggleButton
                                name="Status"
                                options={statusDropdown}
                                value={active}
                                setActive={setActive}
                                required={true}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (deleteId) {
        const childCount = singleData?.data?.childRecord ?? 0;
        const isLoadingRecord = isSingleFetching || isSingleLoading;

        const handleConfirmDelete = async () => {
            try {
                const res = await removeData(deleteId).unwrap();
                if (res?.statusCode === 1) {
                    toast.error(res?.data?.message || "Cannot delete: child records exist");
                    return;
                }
                toast.success("City deleted successfully");
                onSuccess?.();
            } catch (err) {
                toast.error(err?.data?.message || "Failed to delete city");
            }
        };

        return (
            <div className="h-full flex flex-col bg-gray-200">
                <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">Delete City</h2>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 rounded">
                    {isLoadingRecord ? (
                        <p className="text-xs text-gray-400">Checking records...</p>
                    ) : childCount > 0 ? (
                        <>
                            <div className="flex flex-col items-center gap-2">
                                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <p className="text-sm font-semibold text-red-600">Cannot Delete</p>
                                <p className="text-xs text-gray-600 text-center">
                                    <span className="font-semibold">"{deleteLabel}"</span> has{" "}
                                    <span className="font-semibold text-red-600">{childCount} linked record{childCount > 1 ? "s" : ""}</span>.
                                    Remove them first before deleting this city.
                                </p>
                            </div>
                            <button type="button" onClick={onClose}
                                className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded">
                                Close
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-700 text-center">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold">"{deleteLabel}"</span>?
                            </p>
                            <div className="flex gap-3">
                                <button type="button" onClick={onClose}
                                    className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleConfirmDelete}
                                    className="px-4 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded">
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (onSuccess) {
        return (
            <div onKeyDown={handleKeyDown} className="h-full flex flex-col bg-gray-200">
                <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                        {editId ? "Edit City" : "Add New City"}
                    </h2>
                    <button
                        type="button"
                        onClick={() => saveData("close")}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
                    >
                        <Check size={14} />
                        {editId ? "Update" : "Save"}
                    </button>
                </div>
                {formBody}
            </div>
        );
    }

    return (

        <div onKeyDown={handleKeyDown} className="p-1">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-2xl font-bold text-gray-800">City Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setForm(true);
                            onNew();
                        }}
                        className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New City
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
                <ReusableTable
                    columns={columns}
                    data={allData?.data}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={deleteData}
                    itemsPerPage={10}
                />
            </div>

            <div>
                {form === true && (
                    <Modal
                        isOpen={form}
                        form={form}
                        widthClass={"w-[40%] h-[350px]"}
                        onClose={() => {
                            setForm(false);
                        }}
                    >
                        <div className="h-full flex flex-col bg-gray-200 ">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit City Master"
                                                : "City Master"
                                            : "Add New City "}
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
                                                onClick={() => {
                                                    saveData("close");
                                                }}
                                                className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs"
                                            >
                                                <Check size={14} />
                                                {id ? "Update" : "Save & close"}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!readOnly && !id && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    saveData("new");
                                                }}
                                                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                                            >
                                                <Check size={14} />
                                                {"Save & New"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {formBody}
                        </div>
                    </Modal>
                )}
            </div>
        </div >
    );
}




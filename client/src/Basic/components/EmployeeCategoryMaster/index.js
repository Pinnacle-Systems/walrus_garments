import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetEmployeeCategoryQuery,
    useGetEmployeeCategoryByIdQuery,
    useAddEmployeeCategoryMutation,
    useUpdateEmployeeCategoryMutation,
    useDeleteEmployeeCategoryMutation,
} from "../../../redux/services/EmployeeCategoryMasterService";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, Modal, ToggleButton } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from "../MastersForm/MastersForm";
import { statusDropdown } from "../../../Utils/DropdownData";

const MODEL = "Employee Category Master";
export default function Form() {
    const [form, setForm] = useState(false);

    //  const [openTable,setOpenTable] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({});


    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "currentBranchId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetEmployeeCategoryQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetEmployeeCategoryByIdQuery(id, { skip: !id });


    const [addData] = useAddEmployeeCategoryMutation();
    const [updateData] = useUpdateEmployeeCategoryMutation();
    const [removeData] = useDeleteEmployeeCategoryMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setName("");
                setCode("");
                setActive(id ? (data?.active ?? true) : false);
            } else {
                setReadOnly(true);
                setName(data?.name || "");
                setCode(data?.code || "");
                setActive(id ? (data?.active ?? false) : true);
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        name, code, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), id
    }

    const validateData = (data) => {
        if (data.name && data.code) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            syncFormWithDb(undefined)
            toast.success(text + "Successfully");

        } catch (error) {
            console.log("handle");
        }
    };

    const saveData = () => {
        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", {
                position: "top-center",
            });
            return;
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    };

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                const deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    toast.error(deldata?.message)
                    setForm(false)
                    return
                }
                setId("");
                toast.success("Deleted Successfully");
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
        setReadOnly(false);
        setForm(true);
        setSearchValue("");
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const tableHeaders = [
        "S.NO", "Code", "Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
    const tableDataNames = ["index+1", "dataObj.code", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Employee Category Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>

                <Mastertable
                    header={'Employee Category list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    loading={
                        isLoading || isFetching
                    }
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                />

                <div>
                    {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[50%]"} onClose={() => { setForm(false); setErrors({}); }}>
                        <MastersForm
                            onNew={onNew}
                            onClose={() => {
                                setForm(false);
                                setSearchValue("");
                                setId(false);
                            }}
                            model={MODEL}
                            childRecord={childRecord.current}
                            saveData={saveData}
                            setReadOnly={setReadOnly}
                            deleteData={deleteData}
                            readOnly={readOnly}
                            emptyErrors={() => setErrors({})}
                        >
                            <fieldset className="rounded border border-gray-300 p-4 mt-4 shadow-sm bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextInput
                                        name="Category Name"
                                        type="text"
                                        value={name}
                                        setValue={setName}
                                        required={true}
                                        readOnly={readOnly}
                                        disabled={childRecord.current > 0}
                                    />

                                    <TextInput
                                        name="Code"
                                        type="text"
                                        value={code}
                                        setValue={setCode}
                                        required={true}
                                        readOnly={readOnly}
                                        disabled={childRecord.current > 0}
                                    />
                                </div>

                                <div className="mt-4">
                                    <ToggleButton
                                        name="Status"
                                        options={statusDropdown}
                                        value={active}
                                        setActive={setActive}
                                        required={true}
                                        readOnly={readOnly}
                                    />
                                </div>
                            </fieldset>
                        </MastersForm>

                    </Modal>}

                </div>
            </div>
        </div>
    )
}
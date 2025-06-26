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
import { TextInput, CheckBox,  ToggleButton } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from "../MastersForm/MastersForm";
import { statusDropdown } from "../../../Utils/DropdownData";
import { Check, Plus } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import Swal from "sweetalert2";

const MODEL = "Employee Category Master";
export default function Form() {
    
    //  const [openTable,setOpenTable] = useState(false);
    
    const [form, setForm] = useState(false);
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
            // toast.success(text + "Successfully");
            Swal.fire({
                                            title: text + "  " + "Successfully",
                                            icon: "success",
                                            draggable: true,
                                            timer: 1000, // time in milliseconds (2000ms = 2 seconds)
                                            showConfirmButton: false, // hides the OK button
                                            // timerProgressBar: true, // shows a progress bar
                                            didOpen: () => {
                                                Swal.showLoading(); // optional: show loading spinner
                                            }
                                        });
            setForm(false);
        } catch (error) {
            console.log("handle");
            setForm(false);
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

    const deleteData = async (id) => {
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
                // toast.success("Deleted Successfully");
                Swal.fire({
                                                title: "Deleted" + "  " + "Successfully",
                                                icon: "success",
                                                draggable: true,
                                                timer: 1000, // time in milliseconds (2000ms = 2 seconds)
                                                showConfirmButton: false, // hides the OK button
                                                // timerProgressBar: true, // shows a progress bar
                                                didOpen: () => {
                                                    Swal.showLoading(); // optional: show loading spinner
                                                }
                                            });
                setForm(false)
            } catch (error) {
                toast.error("something went wrong");
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
              <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setForm(true);
                              onNew();
                            }}
                            className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Add New Employee Category
                          </button>
                  
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
                    {/* {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[50%]"} onClose={() => { setForm(false); setErrors({}); }}>
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

                    </Modal>} */}
 {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[30%] max-w-6xl h-[50vh]"}
          onClose={() => {
            setForm(false);
            setErrors({});
          }}
        >
          <div className="h-full flex flex-col bg-[f1f1f0]">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Employee Category Master" : "Employee Category Master") : "Add New Employee Category"}
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
                      onClick={saveData}
                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {id ? "Update" : "Save"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1  gap-3  h-full">
                <div className="lg:col-span- space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                   

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
                  </div>

                
                </div>


                      


                     

                     


              </div>
            </div>


          </div>

      
       
        </Modal>
      )}
                </div>
            </div>
        </div>
    )
}
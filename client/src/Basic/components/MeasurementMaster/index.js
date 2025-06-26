import React, { useCallback, useEffect, useRef, useState } from 'react';

import secureLocalStorage from 'react-secure-storage';
import {
    useAddSizeMasterMutation,
    useDeleteSizeMasterMutation,
    useGetSizeMasterByIdQuery,
    useGetSizeMasterQuery,
    useUpdateSizeMasterMutation
} from '../../../redux/uniformService/SizeMasterService';
import toast from 'react-hot-toast';
import MastersForm from '../MastersForm/MastersForm';
import {  TextInput, ToggleButton } from '../../../Inputs';
import Mastertable from '../MasterTable/Mastertable';
import { statusDropdown } from '../../../Utils/DropdownData';
import { useAddMeasurementMasterMutation, useDeleteMeasurementMasterMutation, useGetMeasurementMasterByIdQuery, useGetMeasurementMasterQuery, useUpdateMeasurementMasterMutation } from '../../../redux/uniformService/MeasurementMasterService';
import { Check, Plus } from 'lucide-react';
import Modal from '../../../UiComponents/Modal';
import Swal from 'sweetalert2';

const MODEL = "Measurement Master"
export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [accessory, setAccessory] = useState(false)
    const [active, setActive] = useState(false);
    const [errors, setErrors] = useState({});


    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);



    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    console.log(params, "params")

    const { data: allData, isLoading, isFetching } = useGetMeasurementMasterQuery({ params, searchParams: searchValue });

    console.log(allData, "datatat")

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetMeasurementMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddMeasurementMasterMutation();
    const [updateData] = useUpdateMeasurementMasterMutation();
    const [removeData] = useDeleteMeasurementMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setName("");
                // setAccessory(data?.isAccessory || false);
                      setActive(id ? (data?.active ) : true);

            } else {
                // setReadOnly(true);
                setName(data?.name || "");
                // setAccessory(data?.isAccessory || false);
                setActive(id ? (data?.active ?? false) : true);
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        if (data.name) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
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
        syncFormWithDb(undefined)
        setReadOnly(false);
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const tableHeaders = [
        "S.NO", "Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
    const tableDataNames = ["index+1", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Measurement Master</h5>
                <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setForm(true);
                              onNew();
                            }}
                            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Add New Measurement 
                          </button>
                  
                        </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Measurement list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    deleteData={deleteData}
                    setReadOnly={setReadOnly}
                    data={allData?.data}
                    loading={
                        isLoading || isFetching
                    } />
            </div>
            {/* {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[40%]"} onClose={() => { setForm(false); setErrors({}); }}>
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
                    <fieldset className=' rounded mt-2'>
                        <div className=''>
                            <div className="flex flex-wrap justify-between">
                                <div className='mb-3 w-[48%]'>
                                    <TextInput name="Measurement" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                        
                            </div>
                          

                            <div className='mb-5'>
                                <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                            </div>

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
                  {id ? (!readOnly ? "Edit Measurement Master" : "Employee Measurement Master") : "Add New Measurement Master"}
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
                   
                    <fieldset className=' rounded mt-2'>
                        <div className=''>
                            <div className="flex flex-wrap justify-between">
                                <div className='mb-3 w-[48%]'>
                                    <TextInput name="Measurement" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                        
                            </div>
                          

                            <div className='mb-5'>
                                <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                            </div>

                        </div>
                    </fieldset>

                  </div>

                
                </div>


                      


                     

                     


              </div>
            </div>


          </div>

      
       
        </Modal>
      )}
        </div>
    )
}

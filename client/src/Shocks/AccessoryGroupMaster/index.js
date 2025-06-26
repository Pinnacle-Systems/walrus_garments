import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import {  TextInput, ToggleButton } from '../../Inputs';
import { statusDropdown } from '../../Utils/DropdownData';
import { useAddAccessoryGroupMasterMutation, useDeleteAccessoryGroupMasterMutation, useGetAccessoryGroupMasterByIdQuery, useGetAccessoryGroupMasterQuery, useUpdateAccessoryGroupMasterMutation } from '../../redux/uniformService/AccessoryGroupMasterServices';
import { useDispatch, useSelector } from "react-redux";
import { setOpenPartyModal } from '../../redux/features/openModel';
import { push } from '../../redux/features/opentabs';
import { Check, Plus } from 'lucide-react';
import Modal from '../../UiComponents/Modal';
import Swal from 'sweetalert2';

const MODEL = "Accessory Group Master"

export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({});

    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);
    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetAccessoryGroupMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetAccessoryGroupMasterByIdQuery(id, { skip: !id });
   const dispatch = useDispatch();
     const openPartyModal = useSelector((state) => state.party.openPartyModal);
      const lastTapName =  useSelector((state)=>state.party.lastTab)
    
      console.log(lastTapName,"lastTapName")
    const activeTab = useSelector((state) =>
        state.openTabs.tabs.find((tab) => tab.active).name
      );
      console.log(activeTab, "activeTab")
      useEffect(() => {
        if (openPartyModal) {
          setId("");
          setForm(true);
        }
      }, [openPartyModal]);

    const [addData] = useAddAccessoryGroupMasterMutation();
    const [updateData] = useUpdateAccessoryGroupMasterMutation();
    const [removeData] = useDeleteAccessoryGroupMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setName("");
                setActive(id ? data?.active : true);
            } else {
                // setReadOnly(true);
                setName(data?.name || "");
                setActive(id ? data?.active : true);
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

  const handleSubmitCustom = async (callback, data, text,exit = false) => {
          try {
              let returnData = await callback(data).unwrap();
              setId(returnData?.data?.id)
              syncFormWithDb(undefined)
              toast.success(text + "Successfully");
              dispatch({
                  type: `AccessoryMaster/invalidateTags`,
                  payload: ['AccessoryMaster'],
              });
               if(exit){
                      setForm(false)
                    }
                    if(exit){
                      if (openPartyModal === true && lastTapName) {
                        dispatch(push({ name: lastTapName }));
                      }
                      
                         dispatch(setOpenPartyModal(false));
                    }
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
const saveExitData = () => {
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
          handleSubmitCustom(addData, data, "Added",true);
        }
      };
    const deleteData = async ( id ) => {
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
                dispatch({
                    type: `AccessoryMaster/invalidateTags`,
                    payload: ['AccessoryMaster'],
                });
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
                <h5 className='my-1'>Accessory Group Master</h5>
                     <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setForm(true);
                              onNew();
                            }}
                            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Add Accessory Group
                          </button>
                  
                      </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Accessory Group list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    deleteData={deleteData}
                    setReadOnly={setReadOnly}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    loading={
                        isLoading || isFetching
                    } />
            </div>
            {/* {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[40%]"} onClose={() => { setForm(false); setErrors({});
         if (openPartyModal === true) {
                      dispatch(push({ name: lastTapName }));
                    }
                    dispatch(setOpenPartyModal(false)); }}>
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
                    saveExitData = {saveExitData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                    readOnly={readOnly}
                    emptyErrors={() => setErrors({})}
                >
                    <fieldset className=' rounded mt-2'>
                        <div className=''>
                            <div className='mb-3 w-[48%]'>
                                <TextInput name="Group Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
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
                    widthClass={"w-[40%] max-w-6xl h-[50vh]"}
                    onClose={() => {
                    setForm(false);
                    setErrors({});
                    }}
                >
                                <div className="h-full flex flex-col bg-[f1f1f0]">
                                <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
                                    <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                                        {id ? (!readOnly ? "Edit Accessory Group " : "Fiber Accessory Group ") : "Add New Accessory Group"}
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
              <div className="grid grid-cols-2  gap-3  h-full">
                  <fieldset className=' rounded mt-2'>
                        <div className=''>
                            <div className='mb-3'>
                                <TextInput name="Group Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                            </div>
                            <div className='mb-5'>
                                <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                            </div>
                        </div>
                    </fieldset>                        
                                    </div>
                                </div>
                          </div>
                            </Modal>
         )}
        </div>
    )
}


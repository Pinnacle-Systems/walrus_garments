import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import {
    useGetFinYearQuery,
    useGetFinYearByIdQuery,
    useAddFinYearMutation,
    useUpdateFinYearMutation,
    useDeleteFinYearMutation
} from '../../../redux/services/FinYearMasterService';
import FormHeader from '../FormHeader';
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify"
import { DateInput, CheckBox, DisabledInput,  ToggleButton } from "../../../Inputs"
import ReportTemplate from '../ReportTemplate';
import { getYearShortCode } from '../../../Utils/helper';

import Mastertable from '../MasterTable/Mastertable';
import MastersForm from '../MastersForm/MastersForm';
import { statusDropdown } from '../../../Utils/DropdownData';
import moment from 'moment';
import Modal from '../../../UiComponents/Modal';
import { Check, Plus } from 'lucide-react';
import Swal from 'sweetalert2';



const MODEL = "Fin Year Master";

export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("")
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [active, setActive] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [code, setCode] = useState();
    const childRecord = useRef(0);
    const [errors, setErrors] = useState({});

    console.log(from)

    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: allData, isLoading, isFetching } = useGetFinYearQuery({ params, searchParams: searchValue });
    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetFinYearByIdQuery(id, { skip: !id });

    const [addData] = useAddFinYearMutation();
    const [updateData] = useUpdateFinYearMutation();
    const [removeData] = useDeleteFinYearMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setTo(data?.to || "");
                setFrom(data?.from || "");
                setActive(id ? (data?.active) : true);

                setCode("")
            } else {
                // setReadOnly(true);
                setTo(data?.to ? moment?.utc(data.to).format('YYYY-MM-DD') : "");
                setFrom(data?.from ? moment?.utc(data.from).format('YYYY-MM-DD') : "");
                setActive(id ? (data?.active ?? false) : true);
                setCode((data?.from) && (data?.to) ? getYearShortCode(data?.from, data?.to) : "")
            }
        }, [id])


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


    const data = {
        from, to, active,
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), id
    }

    const validateData = (data) => {
        if (data.from && data.to) {
            return true;
        }
        return false;
    }

    const validateOneActiveFinYear = (active) => {
        if (Boolean(active)) {
            return !allData.data.some((finYear) => id === finYear.id ? false : Boolean(finYear.active))
        }
        return true
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
                            timer: 1000, 
                            showConfirmButton: false, 
                            
                            didOpen: () => {
                                Swal.showLoading(); 
                            }
                        });
            setForm(false);
        } catch (error) {
            console.log("handle")
               setForm(false);
        }
    }

    const saveData = () => {
        if (!validateOneActiveFinYear(data.active)) {
            toast.error("Only one Fin year can be active...!", { position: "top-center" })
            return
        }
        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", { position: "top-center" })
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated")
        } else {
            handleSubmitCustom(addData, data, "Added")
        }
    }

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return
            }
            try {
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    toast.error(deldata?.message)
                    return
                }
                setId("");
                toast.success("Deleted Successfully");
                setForm(false)
            } catch (error) {
                toast.error("something went wrong")
            }
            ;
        }
    }

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === 's') {
            event.preventDefault();
            saveData();
        }
    }

    const onNew = () => { setId(""); setReadOnly(false); setForm(true); setSearchValue("") }

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const tableHeaders = ["S.NO", "from", "to", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    const tableDataNames = ["index+1", "dataObj.from",
        "dataObj.to", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    // const tableDataNames = ["index+1", "moment.utc(dataObj.from).format('DD-MM-YYYY')",
    //     "moment.utc(dataObj.to).format('DD-MM-YYYY')", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Fin Year Master</h5>
                <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setForm(true);
                              onNew();
                            }}
                            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Add New Fin Year
                          </button>
                  
                        </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Fin Year list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    setReadOnly={setReadOnly}
                    loading={
                        isLoading || isFetching
                    }
                    
                    />
            </div>
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
                    <fieldset className=' rounded mt-2'>
                        <div className=''>
                            <div className="flex flex-wrap justify-between">
                                <div className='mb-3 w-[48%]'>
                                    <DateInput name="From" value={from} setValue={setFrom} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                                <div className='mb-3 w-[48%]'>
                                    <DateInput name="To" value={to} setValue={setTo} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                            </div>
                            <div className='mb-3 w-[48%]'>
                                <DisabledInput name="Short Code" value={code} disabled={(childRecord.current > 0)} />
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
                  {id ? (!readOnly ? "Edit Fin year Master" : "Fin year Master") : "Add New Fin year"}
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
                   

                    <div className="space-y-2 w-[50%]">
                      {/* <TextInput
                        ref={input1Ref}
                        name="Full Name"
                        value={name}
                        setValue={setName}
                        required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                      /> */}
                     <DateInput name="From" value={from} setValue={setFrom} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />


                      {errors.name && <span className="text-red-500 text-xs ml-1">{errors.name}</span>}

                            <div className="">
                                    <DateInput name="To" value={to} setValue={setTo} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                           </div>
                           <div>
                                 <DisabledInput name="Short Code" value={code} disabled={(childRecord.current > 0)} />
                           </div>

                        <div>
                          <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly}   disabled={childRecord.current > 0}  />
                        </div>
                        
                    </div>
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

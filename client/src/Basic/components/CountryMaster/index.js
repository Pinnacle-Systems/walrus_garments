import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import {
  useAddCountryMutation, useDeleteCountryMutation,
  useGetCountriesQuery, useGetCountryByIdQuery,
  useUpdateCountryMutation
} from '../../../redux/services/CountryMasterService';
import FormHeader from '../../components/FormHeader';
import FormReport from '../../components/FormReportTemplate';
import { DropdownInput, TextInput, ToggleButton } from '../../../Inputs';
import { statusDropdown } from '../../../Utils/DropdownData';
import Modal from '../../../UiComponents/Modal';
import e from 'cors';
import Mastertable from '../MasterTable/Mastertable';
import MasterForm from '../MastersForm/MastersForm';
import { Check, Plus } from 'lucide-react';



const MODEL = "Country Master";

export default function Form() {

  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("")
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(false);
  const [errors, setErrors] = useState({});

  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);

  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
  const { data: allData, isLoading, isFetching } = useGetCountriesQuery({ params, searchParams: searchValue });
  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetCountryByIdQuery(id, { skip: !id });

  const [addData] = useAddCountryMutation();
  const [updateData] = useUpdateCountryMutation();
  const [removeData] = useDeleteCountryMutation();


  const syncFormWithDb = useCallback((data) => {

    if (!id) {
      setReadOnly(false);
      setName("");
      setCode("");
      setActive(id ? (data?.active ) : true);
      return;
    } else {
      // setReadOnly(true)
      setName(data?.name || "");
      setCode(data?.code || "");
      setActive(id ? (data?.active ?? false) : true);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }
  }, [id])
 

console.log(readOnly, "readOnly")


  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


  const data = {
    name, code, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), active, id
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
      setId(returnData?.data?.id)
      toast.success(text + "Successfully");
        setForm(false);

    } catch (error) {
      console.log("handle")
        setForm(false);

    }
  }

  const saveData = () => {
    console.log("saveData hit")
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
      handleSubmitCustom(addData, data, "Added");
    }
  }

  const deleteData = async (id) => {

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
        setForm(false);
      } catch (error) {
        toast.error("something went wrong")
        setForm(false);
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

  const handleEdit = () =>  {
    setReadOnly(false)
  }
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

  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const input3Ref = useRef(null);
  const handleKeyNext = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };
  return (
    <div onKeyDown={handleKeyDown} className='px-5'>
      {/* <div className='w-full flex justify-between mb-2 items-center px-0.5'>
        <h5 className='my-1 text-xl'>Country Master</h5>
        <div className='flex items-center'>
          <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
        </div>
      </div> */}
        <div className="w-full flex bg-white p-1 justify-between  items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Country Master
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setForm(true);
                    onNew();
                  }}
                  className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add New 
                </button>
              </div>
            
            </div>
      <div className='w-full flex items-start'>

        <Mastertable
          header={'Countries list'}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onDataClick={onDataClick}
          // setOpenTable={setOpenTable}
          setReadOnly={setReadOnly}
          tableHeaders={tableHeaders}
          tableDataNames={tableDataNames}
          data={allData?.data}
          deleteData={deleteData}
          loading={
            isLoading || isFetching
          } />

        {/* <div>
          {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[45%]"} onClose={() => { setForm(false); setErrors({}); }}>
            <MasterForm
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

              <fieldset className=' rounded '>

                <div className='p-2'>
                  <div className='flex'>
                    <div className='mb-3 w-[48%] p-1'>
                      <TextInput name="Country Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} />

                    </div>
                    <div className='mb-3 ml-5 w-[20%]'>
                      <TextInput name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly} />
                    </div>
                  </div>
                  <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                </div>
              </fieldset>
              
            </MasterForm>
          </Modal>}

        </div> */}
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
                <h2 className="text-lg font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Country Master" : "Country Master") : "Add New Country"}
                </h2>
              
              </div>
              <div className="flex gap-2">
                <div>
                  {!readOnly && (
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="lg:col-span- space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                   

                    <div className="space-y-2">
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
                        <TextInput 
                            // ref={input1Ref}
                            name="Country Name" 
                            type="text" 
                            value={name} 
                            setValue={setName}
                            required={true} 
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                          />

                      {errors.name && <span className="text-red-500 text-xs ml-1">{errors.name}</span>}

                        <div className="">
                          <TextInput name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly}   disabled={childRecord.current > 0}/>
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
    </div>
  )
}



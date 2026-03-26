import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import {
  useGetCertificateQuery,
  useGetCertificateByIdQuery,
  useAddCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
} from '../../../redux/services/CertificateMasterService';

import { TextInput, ToggleButton } from '../../../Inputs';
import { statusDropdown } from '../../../Utils/DropdownData';
import Modal from '../../../UiComponents/Modal';
import Mastertable from '../MasterTable/Mastertable';
import { Check, Plus } from 'lucide-react';
const MODEL = "Certificate Master";

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
  const formRef = useRef(null);

  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
  const { data: allData, isLoading, isFetching } = useGetCertificateQuery({ params, searchParams: searchValue });
  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetCertificateByIdQuery(id, { skip: !id });

  const [addData] = useAddCertificateMutation();
  const [updateData] = useUpdateCertificateMutation();
  const [removeData] = useDeleteCertificateMutation();




  const syncFormWithDb = useCallback((data) => {

    if (!id) {
      setReadOnly(false);

      setName("");
      setCode("");
      setActive(true);
      childRecord.current = 0;

      return;
    } else {
      // setReadOnly(true)
      setName(data?.name || "");
      setCode(data?.code || "");
      setActive(id ? (data?.active ?? false) : true);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }
  }, [id])
  console.log(childRecord.current, "childRecord")

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])

  useEffect(() => {
    if (form && formRef.current) {
      const firstInput = formRef.current.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  }, [form]);

  const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

  const data = {
    name, code, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), active, id
  }

  const validateData = (data) => {
    if (data.name && data.code) {
      return true;
    }
    return false;
  }

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id)
      toast.success(text + "Successfully");
      if (nextProcess === "new") {
        syncFormWithDb(undefined);
        onNew();
      } else {
        setForm(false);
      }
    } catch (error) {
      console.log("handle")
    }
  }

  const saveData = (nextProcess) => {
    console.log("saveData hit")
    if (!validateData(data)) {
      toast.error("Please fill all required fields...!", { position: "top-center" })
      return
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess)
      console.log("updateData hit")
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
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
    <div onKeyDown={handleKeyDown} className='px-5'>
      <div className='w-full flex justify-between mb-2 items-center px-0.5'>
        <h5 className='my-1 text-xl'>Certificate Master</h5>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => { setForm(true); onNew() }}
            className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Certificate
          </button>
        </div>
      </div>
      <div className='w-full flex items-start'>
        <Mastertable
          header={'Certificate list'}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onDataClick={onDataClick}
          tableHeaders={tableHeaders}
          tableDataNames={tableDataNames}
          data={allData?.data}
          loading={isLoading || isFetching}
        />
      </div>
      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[30%] max-w-6xl h-[50vh]"}
          onClose={() => { setForm(false); setErrors({}); }}
        >
          <div className="h-full flex flex-col bg-gray-200">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Certificate Master" : "Certificate Master") : "Add New Certificate"}
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

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1 gap-3 h-full">
                <div className="lg:col-span- space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">

                    <div className="flex flex-wrap" ref={formRef}>
                      <div className='mb-3 w-[48%] p-1'>
                        <TextInput name="Certificate Name" type="text" value={name} setValue={handleNameChange} required={true} readOnly={readOnly} disabled={childRecord.current > 0} />
                      </div>
                      <div className='mb-3 ml-5 w-[20%]'>
                        <TextInput name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly} disabled={childRecord.current > 0} />
                      </div>
                      <div className='mb-5 w-full'>
                        <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
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



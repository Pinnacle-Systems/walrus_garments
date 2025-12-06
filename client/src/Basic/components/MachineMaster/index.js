import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import FormHeader from '../../components/FormHeader';
import FormReport from '../../components/FormReportTemplate';
import { ReusableTable, TextInput, ToggleButton } from '../../../Inputs';
import { statusDropdown } from '../../../Utils/DropdownData';
import Modal from '../../../UiComponents/Modal';
import e from 'cors';
import Mastertable from '../MasterTable/Mastertable';
import MasterForm from '../MastersForm/MastersForm';
import { useAddMachineMutation, useDeleteMachineMutation, useGetMachineByIdQuery, useGetMachineQuery, useUpdateMachineMutation } from '../../../redux/services/MachineMasterService';
import { Check, Plus, Power } from 'lucide-react';
import Swal from 'sweetalert2';



const MODEL = "Machine Master";

export default function Form() {
  const [form, setForm] = useState(false);

  // const [openTable, setOpenTable] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("")
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(false);
  const [errors, setErrors] = useState({});

  console.log(name, "name")

  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);

  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
  const { data: allData, isLoading, isFetching } = useGetMachineQuery({ params, searchParams: searchValue });


  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetMachineByIdQuery(id, { skip: !id });

  const [addData] = useAddMachineMutation();
  const [updateData] = useUpdateMachineMutation();
  const [removeData] = useDeleteMachineMutation();


  const syncFormWithDb = useCallback((data) => {

    if (!id) {
      setReadOnly(false);

      setName("");
      setTime("");
      setActive(id ? (data?.active) : true);


      return;
    } else {
      // setReadOnly(true);
      setName(data?.name || "");
      setTime(data?.time || "");
      setCode(data?.code || "");
      setActive(id ? (data?.active ?? false) : true);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }

    // childRecord.current = data?.childRecord ? data?.childRecord : 0;
    // if (data?.childRecord !== 0) {
    //     setReadOnly(true)
    // } else {
    //     setReadOnly(false)
    // }
  }, [id])


  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])

  console.log(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), "companyId")

  const data = {
    name, time, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), active, id, code
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
   
      });


    } catch (error) {
      console.log("handle")
    }
  }

  const saveData = () => {
    if (!validateData(data)) {
      // toast.error("Please fill all required fields...!", { position: "top-center" })
      Swal.fire({
        title:  "Please fill all required fields...!",
        icon: "success",

      });
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
        // toast.success("Deleted Successfully");
        Swal.fire({
          title: "Deleted" + "  " + "Successfully",
          icon: "success",

        });
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
      header: "Machine Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-96",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },

  ];


  return (
    // <div onKeyDown={handleKeyDown} className='px-5'>
    //   <div className='w-full flex justify-between mb-2 items-center px-0.5'>
    //     <h5 className='my-1 text-xl'>Machine Master</h5>
    //     <div className="flex items-center gap-4">
    //       <button
    //         onClick={() => {
    //           setForm(true);
    //           onNew();
    //         }}
    //         className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
    //       >
    //         <Plus size={16} />
    //         Add Machine Master
    //       </button>

    //     </div>
    //   </div>
    //   <div className='w-full flex items-start'>

    //     <Mastertable
    //       header={'Machine Details'}
    //       searchValue={searchValue}
    //       setSearchValue={setSearchValue}
    //       onDataClick={onDataClick}
    //       // setOpenTable={setOpenTable}
    //       tableHeaders={tableHeaders}
    //       setReadOnly={setReadOnly}
    //       deleteData={deleteData}
    //       tableDataNames={tableDataNames}
    //       data={allData?.data}
    //     // loading={
    //     //   isLoading || isFetching
    //     // }
    //     />



    //     {form && (
    //       <Modal
    //         isOpen={form}
    //         form={form}
    //         widthClass={"w-[35%] max-w-6xl h-[50vh]"}
    //         onClose={() => {
    //           setForm(false);
    //           setErrors({});
    //         }}
    //       >
    //         <div className="h-full flex flex-col bg-[f1f1f0]">
    //           <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
    //             <div className="flex items-center gap-2">
    //               <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
    //                 {id ? (!readOnly ? "Edit Machine" : "Machine Master ") : "Add New Machine"}
    //               </h2>

    //             </div>
    //             <div className="flex gap-2">
    //               <div>
    //                 {readOnly && (
    //                   <button
    //                     type="button"
    //                     onClick={() => {
    //                       setForm(false);
    //                       setSearchValue("");
    //                       setId(false);
    //                     }}
    //                     className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
    //                   >
    //                     Cancel
    //                   </button>
    //                 )}
    //               </div>
    //               <div className="flex gap-2">
    //                 {!readOnly && (
    //                   <button
    //                     type="button"
    //                     onClick={saveData}
    //                     className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
    //                                                     border border-green-600 flex items-center gap-1 text-xs"
    //                   >
    //                     <Check size={14} />
    //                     {id ? "Update" : "Save"}
    //                   </button>
    //                 )}
    //               </div>
    //             </div>
    //           </div>

    //           <div className="flex-1 overflow-auto p-3">
    //             <div className="grid grid-cols-2  gap-3  h-full">

    // <div>

    //   <div className=' '>
    //     <TextInput name="Machine Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

    //   </div>

    //   <div className=' '>
    //     <TextInput name="Production Time" type="text" value={time} setValue={setTime} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
    //   </div>
    //   <div className=''>
    //     <TextInput name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
    //   </div>


    //   <div className='mt-2'>
    //     <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />

    //   </div>
    // </div>




    //             </div>
    //           </div>
    //         </div>










    //       </Modal>
    //     )}
    //     <div />
    //   </div>
    // </div>
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-2xl font-bold text-gray-800">Machine Master</h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Machine
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
            widthClass={"w-[36%] h-[50%]"}
            onClose={() => {
              setForm(false);
              // setErrors({});
            }}
          >
            <div className="h-full flex flex-col bg-gray-200 ">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Machine Master"
                        : "Machine Master"
                      : "Add New Machine"}
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

              <div className="flex-1 overflow-auto p-3 ">
                <div className="grid grid-cols-1  gap-3  h-full ">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                      <div className="space-y-4 ">
                        <div className="grid grid-cols-2  gap-3  h-full">
                          <div>

                            <div className=' '>
                              <TextInput name="Machine Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                            </div>

                            <div className=' '>
                              <TextInput name="Production Time" type="text" value={time} setValue={setTime} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                            </div>
                            <div className=''>
                              <TextInput name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                            </div>


                            <div className='mt-2'>
                              <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div >
    </div>
  )
}



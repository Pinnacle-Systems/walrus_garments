import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import { ReusableTable, TextInput, ToggleButton } from '../../Inputs';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { useAddLossReasonMutation, useDeleteLossReasonMutation, useGetLossReasonByIdQuery, useGetLossReasonQuery, useUpdateLossReasonMutation } from '../../redux/uniformService/LossReasonMasterServices';
import { statusDropdown } from '../../Utils/DropdownData';
import { Check, Plus, Power } from 'lucide-react';
import Modal from '../../UiComponents/Modal';
import Swal from 'sweetalert2';




const MODEL = "Loss Reason Master"

export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [reason, setReason] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});

  const formRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);

  useEffect(() => {
    if (form && formRef.current) {
      const firstInput = formRef.current.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  }, [form]);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const { data: allData, isLoading, isFetching } = useGetLossReasonQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetLossReasonByIdQuery(id, { skip: !id });
  const [addData] = useAddLossReasonMutation();
  const [updateData] = useUpdateLossReasonMutation();
  const [removeData] = useDeleteLossReasonMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setReadOnly(false);
        setReason("");
        setActive(id ? (data?.active) : true);

      } else {
        // setReadOnly(true);
        setReason(data?.reason || "");
        setActive(id ? (data?.active ?? false) : true);
      }
    },

    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id, reason, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
  }

  const validateData = (data) => {
    if (data.reason) {
      return true;
    }
    return false;
  }

  const handleReasonChange = (val) => setReason(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id)
      // toast.success(text + "Successfully");
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
        // draggable: true,
        // timer: 1000,
        // showConfirmButton: false,
        // didOpen: () => {
        //   Swal.showLoading();
        // }
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
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
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
          // draggable: true,
          // timer: 1000,
          // showConfirmButton: false,
          // didOpen: () => {
          //   Swal.showLoading();
          // }
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
      saveData("close");
    }
  };

  const onNew = () => {
    setId("");
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined)
    setReadOnly(false);
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
      header: "Loss Reason",
      accessor: (item) => item?.reason,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-96",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },

  ];

  return (
    // <div onKeyDown={handleKeyDown}>
    //   <div className='w-full flex justify-between mb-2 items-center px-0.5'>
    //     <h5 className='my-1'>Loss Reason Master</h5>
    //     <div className="flex items-center gap-4">
    //       <button
    //         onClick={() => {
    //           setForm(true);
    //           onNew();
    //         }}
    //         className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
    //       >
    //         <Plus size={16} />
    //         Add New Loss Reason
    //       </button>

    //     </div>
    //   </div>
    //   <div className='w-full flex items-start'>
    //     <Mastertable
    //       header={'Loss Reason list'}
    //       searchValue={searchValue}
    //       setSearchValue={setSearchValue}
    //       onDataClick={onDataClick}
    //       // setOpenTable={setOpenTable}
    //       tableHeaders={tableHeaders}
    //       tableDataNames={tableDataNames}
    //       deleteData={deleteData}
    //       setReadOnly={setReadOnly}
    //       data={allData?.data}
    //       loading={
    //         isLoading || isFetching
    //       } />
    //   </div>

    //   {form && (
    //     <Modal
    //       isOpen={form}
    //       form={form}
    //       widthClass={"w-[30%] max-w-6xl h-[50vh]"}
    //       onClose={() => {
    //         setForm(false);
    //         setErrors({});
    //       }}
    //     >
    //       <div className="h-full flex flex-col bg-[f1f1f0]">
    //         <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
    //           <div className="flex items-center gap-2">
    //             <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
    //               {id ? (!readOnly ? "Edit Loss Reason " : " Loss Reason Master") : "Add New Loss Reason "}
    //             </h2>

    //           </div>
    //           <div className="flex gap-2">
    //             <div>
    //               {readOnly && (
    //                 <button
    //                   type="button"
    //                   onClick={() => {
    //                     setForm(false);
    //                     setSearchValue("");
    //                     setId(false);
    //                   }}
    //                   className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
    //                 >
    //                   Cancel
    //                 </button>
    //               )}
    //             </div>
    //             <div className="flex gap-2">
    //               {!readOnly && (
    //                 <button
    //                   type="button"
    //                   onClick={saveData}
    //                   className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600
    //               border border-green-600 flex items-center gap-1 text-xs"
    //                 >
    //                   <Check size={14} />
    //                   {id ? "Update" : "Save"}
    //                 </button>
    //               )}
    //             </div>
    //           </div>
    //         </div>

    //         <div className="flex-1 overflow-auto p-3">
    //           <div className="grid grid-cols-1  gap-3  h-full">
    //             <div className="lg:col-span- space-y-3">
    //               <div className="bg-white p-3 rounded-md border border-gray-200 h-full">

    // <fieldset className=' rounded mt-2'>
    //   <div className=''>
    //     <div className='mb-3 w-[48%] h-[48%] '>
    //       <TextInput name="Reason" type="text" value={reason} setValue={setReason} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
    //     </div>
    //     <div className='mb-5'>
    //       <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
    //     </div>
    //   </div>
    // </fieldset>

    //               </div>


    //             </div>




    //           </div>
    //         </div>


    //       </div>



    //     </Modal>
    //   )}
    // </div>
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-2xl font-bold text-gray-800">Loss Reason Master</h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Loss Reason
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
                        ? "Edit Loss Reason Master"
                        : "Loss Reason Master"
                      : "Add New Loss Reason  "}
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
                      <button
                        type="button"
                        onClick={() => saveData("new")}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        Save & New
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
                          <fieldset className=' rounded mt-2' ref={formRef}>
                            <div className='mb-5 '>
                              <TextInput name="Reason" type="text" value={reason} setValue={handleReasonChange} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                            </div>
                            <div className='mb-5'>
                              <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                            </div>
                          </fieldset>

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
    </div >
  )
}



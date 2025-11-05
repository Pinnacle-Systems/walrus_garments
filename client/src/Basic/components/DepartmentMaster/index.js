
import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetDepartmentQuery,
  useGetDepartmentByIdQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "../../../redux/services/DepartmentMasterService";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, ToggleButton, ReusableTable } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from "../MastersForm/MastersForm";
import { statusDropdown } from "../../../Utils/DropdownData";
import { Check, Plus, Power } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import Swal from "sweetalert2";

const MODEL = "Department Master";

export default function Form() {


  // const [openTable, setOpenTable] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);

  console.log(readOnly, "readOnly")
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const { data: allData, isLoading, isFetching } = useGetDepartmentQuery({ params, searchParams: searchValue });
  console.log(id, "id")
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetDepartmentByIdQuery(id, { skip: !id });


  const [addData] = useAddDepartmentMutation();
  const [updateData] = useUpdateDepartmentMutation();
  const [removeData] = useDeleteDepartmentMutation();

  const syncFormWithDb = useCallback((data) => {
    if (!id) {
      setReadOnly(false);
      setName("");
      setCode("");
      setActive(id ? (data?.active ?? true) : false);
    } else {
      // setReadOnly(true);

      setName(data?.name || "");
      setCode(data?.code || "");
      setActive(id ? (data?.active ?? false) : true);
    }

  },
    [id]
  );
  console.log(id, readOnly, "idreadonly")

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name, code, active, companyId: 1, id
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
      // toast.success(text + "Successfully");
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",

      });
      setForm(false);
    } catch (error) {
      console.log("handle");
      setForm(false);

    }
  };

  const saveData = () => {
    if (readOnly) return toast.info("Turn On Edit Mode !..")

    if (!validateData(data)) {
      // toast.error("Please fill all required fields...!", {
      //   position: "top-center",
      // });
      Swal.fire({
        text: "Please fill all required fields...!",
        icon: "warning",
      });
      return;
    }

    let foundItem;
    if (id) {
      foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item.name === name);
    } else {
      foundItem = allData?.data?.some(item => item.name === name);

    }
    if (foundItem) {
      Swal.fire({
        text: "The Department  Name already exists.",
        icon: "warning",
      });
      return false;
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
      setForm(false)
      if (!window.confirm("Are you sure to delete...?")) {

        return false;
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


        });
        setForm(false)
      } catch (error) {
        toast.error("something went wrong");
        setForm(false)
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
      header: "Department Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-64",
    },


    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },

  ];

  return (
    //   <div onKeyDown={handleKeyDown}>
    //       <div className='w-full flex justify-between mb-2 items-center px-0.5'>
    //           <h5 className='my-1'>Department Master</h5>
    //          <div className="flex items-center gap-4">
    //                     <button
    //                       onClick={() => {
    //                         setForm(true);
    //                         onNew();
    //                       }}
    //                       className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
    //                     >
    //                       <Plus size={16} />
    //                       Add New Department
    //                     </button>

    //                   </div>
    //       </div>
    //       <div className='w-full flex items-start'>
    //           <Mastertable
    //               header={'Department list'}
    //               searchValue={searchValue}
    //               setSearchValue={setSearchValue}
    //               onDataClick={onDataClick}
    //               tableHeaders={tableHeaders}
    //               tableDataNames={tableDataNames}
    //               data={allData?.data}
    //               loading={
    //                   isLoading || isFetching
    //               }
    //               setReadOnly={setReadOnly}
    //               deleteData={deleteData}
    //           />
    //       </div>

    //    {form && (
    //   <Modal
    //     isOpen={form}
    //     form={form}
    //     widthClass={"w-[30%] max-w-6xl h-[50vh]"}
    //     onClose={() => {
    //       setForm(false);
    //       setErrors({});
    //     }}
    //   >
    //     <div className="h-full flex flex-col bg-[f1f1f0]">
    //       <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
    //         <div className="flex items-center gap-2">
    //           <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
    //             {id ? (!readOnly ? "Edit Department Master" : "Department Master") : "Add New Department"}
    //           </h2>

    //         </div>
    //         <div className="flex gap-2">
    //           <div>
    //             {readOnly && (
    //               <button
    //                 type="button"
    //                 onClick={() => {
    //                   setForm(false);
    //                   setSearchValue("");
    //                   setId(false);
    //                 }}
    //                 className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
    //               >
    //                 Cancel
    //               </button>
    //             )}
    //           </div>
    //           <div className="flex gap-2">
    //             {!readOnly && (
    //               <button
    //                 type="button"
    //                 onClick={saveData}
    //                 className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
    //             border border-green-600 flex items-center gap-1 text-xs"
    //               >
    //                 <Check size={14} />
    //                 {id ? "Update" : "Save"}
    //               </button>
    //             )}
    //           </div>
    //         </div>
    //       </div>

    //       <div className="flex-1 overflow-auto p-3">
    //         <div className="grid grid-cols-1  gap-3  h-full">
    //           <div className="lg:col-span- space-y-3">
    //             <div className="bg-white p-3 rounded-md border border-gray-200 h-full">


    //               <div className="space-y-2 w-[50%]">

    //                   <TextInput 
    //                       // ref={input1Ref}
    //                       name="Department Name" 
    //                       type="text" 
    //                       value={name} 
    //                       setValue={setName}
    //                       required={true} 
    //                       readOnly={readOnly}
    //                       disabled={childRecord?.current > 0}
    //                       // onKeyDown={(e) => handleKeyNext(e, input2Ref)}
    //                     />

    //                 {errors.name && <span className="text-red-500 text-xs ml-1">{errors.name}</span>}

    //                   <div className="">
    //                     <TextInput name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly}   disabled={childRecord.current > 0}/>
    //                      </div>
    //                   <div>
    //                     <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly}   disabled={childRecord.current > 0}  />
    //                   </div>

    //               </div>
    //             </div>


    //           </div>










    //         </div>
    //       </div>


    //     </div>



    //   </Modal>
    // )}
    //   </div>
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-2xl font-bold text-gray-800">Department Master</h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Department
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
            widthClass={"w-[40%] h-[45%]"}
            onClose={() => {
              setForm(false);
              setErrors({});
            }}
          >
            <div className="h-full flex flex-col bg-[f1f1f0] ">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Department Master"
                        : "Department Master"
                      : "Add New Department"}
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
                          <div className="space-y-2 ">

                            <TextInput
                              name="Department Name"
                              type="text"
                              value={name}
                              setValue={setName}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord?.current > 0}
                            />

                            {errors.name && <span className="text-red-500 text-xs ml-1">{errors.name}</span>}

                            <div className="">
                              <TextInput name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly} disabled={childRecord.current > 0} />
                            </div>
                            <div>
                              <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} disabled={childRecord.current > 0} />
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
    </div >
  )
}

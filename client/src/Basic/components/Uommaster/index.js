import { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetUnitOfMeasurementMasterQuery,
  useGetUnitOfMeasurementMasterByIdQuery,
  useAddUnitOfMeasurementMasterMutation,
  useUpdateUnitOfMeasurementMasterMutation,
  useDeleteUnitOfMeasurementMasterMutation,
} from "../../../redux/uniformService/UnitOfMeasurementServices";

import { toast } from "react-toastify";
import { TextInput, ToggleButton, ReusableTable, TextInputNew1, childRecordCountTotal } from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";
import { statusDropdown } from "../../../Utils/DropdownData";
import Swal from "sweetalert2";
import useInvalidateTags from '../../../CustomHooks/useInvalidateTags';
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";

export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [accessory, setAccessory] = useState(false)
  const [active, setActive] = useState(true);
  const [childRecord, setChildRecord] = useState(0);


  const [searchValue, setSearchValue] = useState("");
  // const nameRef = useRef(null);
  const formRef = useRef(null);


  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const { data: allData, isLoading, isFetching } = useGetUnitOfMeasurementMasterQuery({ params, searchParams: searchValue });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetUnitOfMeasurementMasterByIdQuery
      (id, { skip: !id });



  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
  const {
    firstInputRef: nameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;


  const [addData] = useAddUnitOfMeasurementMasterMutation();
  const [updateData] = useUpdateUnitOfMeasurementMasterMutation();
  const [removeData] = useDeleteUnitOfMeasurementMasterMutation();
  const [dispatchInvalidate] = useInvalidateTags();

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setName("");
        setActive(true);
        setChildRecord(data?._count ? childRecordCountTotal(data?._count) : 0)

      } else {
        // if (id) setReadOnly(true);
        setName(data?.name ? data.name : "");
        setActive(id ? (data?.active ? data.active : false) : true);
        setChildRecord(data?._count ? childRecordCountTotal(data?._count) : 0)
      }
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id, name,
    // accessory,
    active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
  }

  const validateData = (data) => {
    if (data.name) {
      return true;
    }
    return false;
  }

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      await callback(data).unwrap();
      setId("");
      syncFormWithDb(undefined);
      dispatchInvalidate();
      await Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
      });
      if (nextProcess == "new") {
        syncFormWithDb(undefined)
        onNew()
        nameRef.current?.focus();
      } else {
        setForm(false)
      }

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        text: error.data?.message || 'Something went wrong!',
        didClose: () => {
          nameRef?.current?.focus();
        }
      });
    }
  };

  const saveData = (nextProcess) => {
    const upperName = name.toUpperCase();
    const finalData = {
      ...data,
      name: upperName
    };

    if (!validateData(finalData)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
        didClose: () => {
          nameRef?.current?.focus();
        }
      });
      return;
    }
    let foundItem;
    if (id) {
      foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item.name.toUpperCase() === upperName);
    } else {
      foundItem = allData?.data?.some(item => item.name.toUpperCase() === upperName);

    }
    if (foundItem) {
      Swal.fire({
        text: "The Uom Name already exists.",
        icon: "warning",
        didClose: () => {
          nameRef?.current?.focus();
        }
      });
      return false;
    }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (id) {
      handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, finalData, "Added", nextProcess);
    }
  };

  const deleteData = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id).unwrap()
        setId("");
        dispatchInvalidate();
        await Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Submission error',
          text: error.data?.message || 'Something went wrong!',
        });
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
    setTimeout(() => {
      nameRef.current?.focus();
    }, 100);
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
      header: "Uom",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-48 ",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },

  ];


  useEffect(() => {
    if (form && nameRef.current) {
      nameRef.current.focus();
    }
  }, [form]);

  const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);
  return (

    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-2xl font-bold text-gray-800">Unit Of Mesaurement Master</h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Unit Of Mesaurement
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
          itemsPerPage={15}
        />
      </div>

      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[40%] h-[40%]"}
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
                        ? "Edit Unit Of Mesaurement"
                        : "Unit Of Mesaurement Master"
                      : "Add New Unit Of Mesaurement  "}
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
                        onClick={() => {
                          saveData("close")
                        }}
                        ref={saveCloseButtonRef}
                        tabIndex={0} // ✅ Add tabIndex
                        onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                           border border-blue-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {id ? "Update" : "Save & close"}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(!readOnly && !id) && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("new")
                        }}
                        ref={saveNewButtonRef}
                        tabIndex={0}
                        onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                           border border-green-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {"Save & New"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-3 ">
                <div className="grid grid-cols-1  gap-3  h-full ">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full" ref={formRef}>
                      <div className="space-y-4 ">
                        <div className="grid grid-cols-2  gap-3  h-full">
                          <fieldset className=''>
                            <div className="mb-5">
                              <TextInputNew1
                                name="Uom Name"
                                type="text"
                                value={name}
                                setValue={setName}
                                required={true}
                                readOnly={readOnly}
                                disabled={(childRecord > 0)}
                                ref={nameRef}
                              />
                            </div>
                            <div>
                              <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly}
                                onKeyDown={handlers.handleToggleKeyDown}
                                ref={toggleButtonRef}
                              />
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

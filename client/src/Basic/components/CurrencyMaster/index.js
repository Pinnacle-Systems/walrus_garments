import { useCallback, useEffect, useRef, useState } from 'react'
import { push } from '../../../redux/features/opentabs';

import secureLocalStorage from 'react-secure-storage';
import {
  useAddCurrencyMasterMutation,
  useDeleteCurrencyMasterMutation,
  useGetCurrencyMasterByIdQuery,
  useGetCurrencyMasterQuery,
  useUpdateCurrencyMasterMutation
} from '../../../redux/services/CurrencyMasterServices';
import toast from 'react-hot-toast';
import { statusDropdown } from '../../../Utils/DropdownData';
import { ReusableTable, TextInput, TextInputNew1, ToggleButton } from '../../../Inputs';
import { useDispatch, useSelector } from 'react-redux';
import useInvalidateTags from '../../../CustomHooks/useInvalidateTags';
import { Check, Power } from 'lucide-react';
import Modal from '../../../UiComponents/Modal';
import Swal from 'sweetalert2';
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import MasterPageLayout from "../MasterPageLayout";



export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch()

  const [searchValue, setSearchValue] = useState("");
  // const nameRef = useRef(null);
  const childRecord = useRef(0);
  const formRef = useRef(null);


  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const { data: allData } = useGetCurrencyMasterQuery({ params, searchParams: searchValue });
  console.log(allData, "allData")
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetCurrencyMasterByIdQuery(id, { skip: !id });
  const openPartyModal = useSelector((state) => state.party.openPartyModal);
  console.log(openPartyModal, "openPartyModel")

  useEffect(() => {
    if (openPartyModal) {
      setForm(true);
      setId('')
    }
  }, [openPartyModal]);
  const lastTapName = useSelector((state) => state.party.lastTab)
  console.log(lastTapName, "lastTapName")

  const [addData] = useAddCurrencyMasterMutation();
  const [updateData] = useUpdateCurrencyMasterMutation();
  const [removeData] = useDeleteCurrencyMasterMutation();
  const [dispatchInvalidate] = useInvalidateTags();


  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
  const {
    firstInputRef: nameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;


  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setName("");
        setCode("");
        setActive(true);
        childRecord.current = 0;

      } else {
        // setReadOnly(true);
        setName(data?.name || "");
        setCode(data?.code || "");
        setActive(id ? (data?.active ?? false) : true);
        childRecord.current = data?.childRecord ? data?.childRecord : 0;
      }
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {
    if (form && nameRef.current) {
      nameRef.current.focus();
    }
  }, [form]);

  const data = {
    id, name, code, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
  }

  const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

  const validateData = (data) => {
    if (data.name) {
      return true;
    }
    return false;
  }

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      dispatchInvalidate();
      await Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
      });
      if (nextProcess === "new") {
        syncFormWithDb(undefined);
        setId("")
        onNew();
        nameRef.current.focus();

      } else {
        setForm(false);
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
    const upperCode = code.toUpperCase();

    const finalData = {
      ...data,
      name: upperName,
      code: upperCode
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
        text: "The Currency Name already exists.",
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
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          await Swal.fire({
            icon: 'error',
            text: deldata?.message || 'Something went wrong!',
          });
          return
        }
        setId("");
        dispatchInvalidate();
        await Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        setForm(false);
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Submission error',
          text: error.data?.message || 'Something went wrong!',
        });
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
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined)
    setReadOnly(false);
    setTimeout(() => {
      nameRef.current?.focus();
    }, 100);
  };

  console.log(openPartyModal, "openPartyModal")


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
      header: "Currency Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left pl-2 uppercase w-48",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },

  ];



  return (

    <MasterPageLayout
      title="Currency Master"
      addButtonLabel="+ Add New Currency"
      onAdd={() => {
        setForm(true);
        onNew();
      }}
      onKeyDown={handleKeyDown}
    >
        <ReusableTable
          columns={columns}
          data={allData?.data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />

      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[40%] h-[40%]"}
            onClose={() => {
              setForm(false);
              setErrors({});
            }}
          >
            <div className="h-full flex flex-col bg-gray-200 ">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Currency  Master"
                        : "Currency  Master"
                      : "Add New Currency "}
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
                        ref={saveCloseButtonRef}
                        onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600
                                border border-blue-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {id ? "Update" : "Save & close"}
                      </button>
                    )}
                    {(!readOnly && !id) && (
                      <button type="button" onClick={() => saveData("new")}
                        ref={saveNewButtonRef} // ✅ Add ref
                        tabIndex={0} // ✅ Add tabIndex
                        onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs">
                        <Check size={14} />Save & New
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
                        <div className="grid grid-cols-2  gap-3  " ref={formRef}>



                          <div className='mb-3'>
                            <TextInputNew1
                              name="Currency Name"
                              type="text"
                              value={name}
                              setValue={setName}
                              required={true}
                              readOnly={readOnly}
                              disabled={(childRecord.current > 0)}
                              ref={nameRef}
                            />

                          </div>
                          <div className='mb-3'>
                            <TextInputNew1 name="Code" type="text" value={code} setValue={setCode} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                          </div>

                          <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly}
                            onKeyDown={handlers.handleToggleKeyDown}
                            ref={toggleButtonRef}
                          />

                          <div>

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
    </MasterPageLayout>
  )
}

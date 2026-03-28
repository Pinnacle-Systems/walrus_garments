import { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useAddbranchTypeMutation, useDeletebranchTypeMutation, useGetbranchTypeByIdQuery, useGetbranchTypeQuery, useUpdatebranchTypeMutation } from "../../../redux/uniformService/BranchTypeMaster";
import useInvalidateTags from '../../../CustomHooks/useInvalidateTags';
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Check, Plus, Power } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import { ReusableTable, TextInput, TextInputNew1, ToggleButton } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";


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
  const searchRef = useRef(null);
  const nameRef = useRef(null);
  const formRef = useRef(null)

  console.log(readOnly, "readOnly")
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const { data: allData, isLoading, isFetching } = useGetbranchTypeQuery({ params, searchParams: searchValue });
  console.log(allData, "allData")
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetbranchTypeByIdQuery(id, { skip: !id });


  const [addData] = useAddbranchTypeMutation();
  const [updateData] = useUpdatebranchTypeMutation();
  const [removeData] = useDeletebranchTypeMutation();
  const [dispatchInvalidate] = useInvalidateTags();

  const syncFormWithDb = useCallback((data) => {
    if (!id) {
      setName("");
      setCode("");
      setActive(id ? (data?.active ?? true) : true);
      childRecord.current = data?.childRecord ? data.childRecord : 0;

    } else {
      // setReadOnly(true);

      setName(data?.name || "");
      setCode(data?.code || "");
      setActive(id ? (data?.active ?? false) : true);
      childRecord.current = data?.childRecord ? data.childRecord : 0;

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
    if (data.name) {
      return true;
    }
    return false;
  }

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id)
      dispatchInvalidate();
      // toast.success(text + "Successfully");
      await Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
      });

      if (nextProcess == "new") {
        syncFormWithDb(undefined)
        onNew()
      } else {
        setForm(false)
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Submission error',
        text: error.data?.message || 'Something went wrong!',
      });
      nameRef.current?.focus();
      setForm(false);

    }
  };

  const saveData = (nextProcess) => {
    if (readOnly) return toast.info("Turn On Edit Mode !..")

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
      });
      nameRef.current?.focus();
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
        text: "The Branch Type already exists.",
        icon: "warning",
      });
      nameRef.current?.focus();
      return false;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, finalData, "Added", nextProcess);
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
          await Swal.fire({
            icon: 'error',
            title: 'Submission error',
            text: deldata?.message || 'Something went wrong!',
          });
          setForm(false)
          return
        }
        setId("");
        dispatchInvalidate();
        await Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        setForm(false);
        setTimeout(() => searchRef.current?.focus(), 100);
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Submission error',
          text: error.data?.message || 'Something went wrong!',
        });
        setForm(false);
        setTimeout(() => searchRef.current?.focus(), 100);
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
    syncFormWithDb(undefined)
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
      header: "BranchType",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-72",
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
        <h5 className="text-2xl font-bold text-gray-800">BranchType Master</h5>
        <div className="flex items-center gap-3">
          {/* <input
            ref={searchRef}
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-sm"
            autoFocus
          /> */}
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New BranchType
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
            widthClass={"w-[36%] h-[45%]"}
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
                        ? "Edit BranchType"
                        : "BranchType Master"
                      : "Add New BranchType"}
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
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                      <div className="space-y-4 ">
                        <div ref={formRef} className="grid grid-cols-2  gap-3  h-full">
                          <fieldset className=' rounded mt-2'>

                            <TextInputNew1
                              name="Branch Type Name"
                              type="text"
                              value={name}
                              setValue={setName}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord?.current > 0}
                              ref={nameRef}

                            />

                            {errors.name && <span className="text-red-500 text-xs ml-1">{errors.name}</span>}

                            <div className='mt-4'>
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

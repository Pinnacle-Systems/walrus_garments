import { useCallback, useEffect, useState } from "react";
import { useDeletePartyMaterialMutation, useGetPartyMaterialByIdQuery, useUpdatePartyMaterialMutation } from "../../redux/services/PartyMasterService";
import { useAddMaterialMasterMutation, useDeleteMaterialMasterMutation, useGetMaterialMasterByIdQuery, useGetMaterialMasterQuery, useUpdateMaterialMasterMutation } from "../../redux/uniformService/MaterialMasterServices";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { ReusableTable, TextInput, ToggleButton } from "../../Inputs";
import { Check, Eye, Power } from "lucide-react";
import { statusDropdown } from "../../Utils/DropdownData";
import { FaPlus } from "react-icons/fa6";
import { getCommonParams } from "../../Utils/helper";
import Modal from "../../UiComponents/Modal";


export default function Form() {

  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [active, setActive] = useState('')
  const [readOnly, setReadOnly] = useState(false)
  const [form, setForm] = useState("")

  const { branchId, companyId, userId, finYearId } = getCommonParams()


  const params = {
    branchId, companyId, userId, finYearId
  };
  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetMaterialMasterQuery({ params });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetMaterialMasterByIdQuery(id, { skip: !id });
  const [addData] = useAddMaterialMasterMutation()
  const [removeData] = useDeleteMaterialMasterMutation()
  const [updateData] = useUpdateMaterialMasterMutation()




  const data = {

    id, name, active
  };

  const onNew = () => {
    setName("");
    setId('')
  }



  const syncFormWithDb = useCallback(
    (data) => {
      setName(data?.name ? data?.name : null)
      setActive(data?.active)



    },

    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleLoading, isSingleFetching, singleData, id, syncFormWithDb]);
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
      header: 'S.No',
      accessor: (item, index) => index + 1,
      className: 'font-medium text-gray-900 w-12 text-center'
    },

    {
      header: 'Name',
      accessor: (item) => item.name,
      className: 'font-medium text-left text-gray-900 w-64'
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },



  ];

  const handleView = (id) => {

    setId(id)
    setForm(true)
    //    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setId(id)
    setForm(true)
    //    setReadOnly(false);
  };




  const validateData = (data) => {
    if (data.name) {
      return true;
    }
    return false;
  }

  const saveData = () => {
    if (!validateData(data)) {
      // toast.error("Please fill all required fields...!", {
      //   position: "top-center",
      // });
      Swal.fire({
        icon: 'success',
        title: `Please fill all required fields...!`,

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


  const handleSubmitCustom = async (callback, data, text, exit = false) => {
    try {
      let returnData;
      if (text === "Updated") {

        returnData = await callback(data).unwrap();
        setId(returnData?.data?.id)
        setForm(false)

      } else {
        returnData = await callback(data).unwrap();
        setId(returnData?.data?.id)
        setForm(false)

      }
      Swal.fire({
        icon: 'success',
        title: `${text || 'Saved'} Successfully`,

      });

    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Submission error',
      });
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
          toast.error(deldata?.message)
          return
        }
        setId("");
        Swal.fire({
          title: "Deleted" + "  " + "Successfully",
          icon: "success",

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
      // saveData();
    }
  };
  return (

    <div onKeyDown={handleKeyDown} className="p-1 h-[90%]">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-2xl font-bold text-gray-800">Material Master</h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Material
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3 ">
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
            widthClass={"w-[40%] h-[45%]"}
            onClose={() => {
              setForm(false);
              // setErrors({});
            }}
          >
            <div className="h-full flex flex-col bg-[f1f1f0]">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Material Master"
                        : "Material Master"
                      : "Add New Material"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <div>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(false);
                          // setSearchValue("");
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
                      <div className="space-y-4 ">
                        <fieldset className=' rounded mt-2'>
                          <div className=''>
                            <div className='mb-3 w-[48%]'>
                              <TextInput name="Meterial Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} />
                            </div>

                            <div className='mb-5'>
                              <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                            </div>
                          </div>
                        </fieldset>
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














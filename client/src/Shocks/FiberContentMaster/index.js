import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import { useGetContentMasterQuery } from '../../redux/uniformService/ContentMasterServices';
import { useGetYarnBlendMasterQuery } from '../../redux/uniformService/YarnBlendMasterServices';
import { useGetYarnTypeMasterQuery } from '../../redux/uniformService/YarnTypeMasterServices';
import { useAddYarnMasterMutation, useDeleteYarnMasterMutation, useGetYarnMasterByIdQuery, useGetYarnMasterQuery, useUpdateYarnMasterMutation } from '../../redux/uniformService/YarnMasterServices';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import { ReusableTable, TextInput, ToggleButton } from '../../Inputs';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { statusDropdown } from '../../Utils/DropdownData';
import { dropDownListObject } from '../../Utils/contructObject';
import { useGetCountsMasterQuery } from '../../redux/uniformService/CountsMasterServices';

import { useGetFabricMasterQuery } from '../../redux/uniformService/FabricMasterService';
import { useAddFiberContentMasterMutation, useDeleteFiberContentMasterMutation, useGetFiberContentMasterByIdQuery, useGetFiberContentMasterQuery, useUpdateFiberContentMasterMutation } from '../../redux/uniformService/FiberContentMasterServices';
import YarnBlendDetails from './YarnBlendDetails';
import { Check, Plus, Power } from 'lucide-react';
import Modal from '../../UiComponents/Modal';
import Swal from 'sweetalert2';


export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [fabricName, setFabricName] = useState("")
  const [id, setId] = useState("");
  const [aliasName, setAliasName] = useState("");
  const [fiberBlend, setFiberBlend] = useState("");

  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});


  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);
  const formRef = useRef(null);

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )

  const params = {
    companyId
  };



  const { data: fabricList } =
    useGetFabricMasterQuery({ params });

  const { data: allData, isLoading, isFetching } = useGetFiberContentMasterQuery({ params, searchParams: searchValue });


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetFiberContentMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddFiberContentMasterMutation();
  const [updateData] = useUpdateFiberContentMasterMutation();
  const [removeData] = useDeleteFiberContentMasterMutation();

  const syncFormWithDb = useCallback((data) => {
    // if (id) setReadOnly(true);
    if (id) setAliasName(data?.aliasName ? data?.aliasName : "");
    setFabricName(data?.fabricName ? data?.fabricName : "")
    setFiberBlend(data?.fiberBlend ? data?.fiberBlend : [])
    setActive(id ? (data?.active ? data.active : false) : true);
  }, [id]);

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);


  useEffect(() => {
    setAliasName(fabricName)
  }, [fabricName, setFabricName]);

  useEffect(() => {
    if (form && formRef.current) {
      const firstInput = formRef.current.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  }, [form]);


  const data = {
    aliasName, fabricName,
    fiberBlend: fiberBlend ? fiberBlend.filter(item => item.fabricId) : undefined,
    active, companyId, id
  }

  console.log(fabricName, "fabricName")

  const validatePercentage = () => {
    const yarnBlendPercentage = fiberBlend.filter(blend => blend.yarnBlendId).reduce((accumulator, currentValue) => {
      return accumulator + parseInt(currentValue.percentage)
    }, 0);
    return yarnBlendPercentage === 100
  }


  const validateData = (data) => {
    return data.aliasName
  }

  const handleNameChange = (val) => setFabricName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      setId(returnData.data.id)
      // toast.success(text + "Successfully");
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
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
      // toast.error("Please fill all required fields...!", { position: "top-center" })
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "success",

      });
      return
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  }

  const deleteData = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id)
        setId("");
        onNew();
        // toast.success("Deleted Successfully");
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
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setForm(true);
    setSearchValue("");
    setReadOnly(false);
    syncFormWithDb(undefined)
  };



  function findName(arr, id) {
    if (!arr) return ""
    let data = arr.find(item => parseInt(item.id) === parseInt(id))
    return data ? data.aliasName : ""
  }

  const calculateFabricName = () => {


    let fiberBlendDet = fiberBlend ?
      fiberBlend?.filter(blend => blend.fabricId && blend.percentage).map(blend => `${parseInt(blend.percentage)}%${findName(fabricList?.data, blend.fabricId)}`).join(' ') : "";
    if (!fiberBlendDet) return ""

    return `${fabricName}/ ${fiberBlendDet} `
  }


  // useEffect(() => {
  //   if (id) return
  //   setAliasName(calculateFabricName())
  // }, [fiberBlend, aliasName])


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
      header: "Style",
      accessor: (item) => item?.fabricName,
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

    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-2xl font-bold text-gray-800">Fiber Content Master</h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Fiber Content
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
                        ? "Edit Fiber Content Master"
                        : "Fiber Content Master"
                      : "Add New Fiber Content  "}
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

              <div className="flex-1 overflow-auto p-3 ">
                <div ref={formRef} className="grid grid-cols-1  gap-3  h-full ">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                      <div className="space-y-4 ">
                        <div className="grid grid-cols-2  gap-3  h-full">
                          <fieldset className="">



                            <TextInput
                              name="Name"
                              className="w-full"
                              type="text"
                              value={fabricName}
                              setValue={handleNameChange}
                              readOnly={readOnly}

                              disabled={childRecord.current > 0}
                            />



                            <TextInput
                              name="Alias Name"
                              className="w-full"
                              type="text"
                              value={aliasName}
                              setValue={setAliasName}
                              readOnly={readOnly}
                              required
                              disabled={childRecord.current > 0}
                            />




                            <ToggleButton
                              name="Status"
                              options={statusDropdown}
                              value={active}
                              setActive={setActive}
                              required
                              readOnly={readOnly}
                            />
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





















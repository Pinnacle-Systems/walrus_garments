import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { useGetContentMasterQuery } from '../../redux/uniformService/ContentMasterServices';
import { useGetYarnBlendMasterQuery } from '../../redux/uniformService/YarnBlendMasterServices';
import { useGetYarnTypeMasterQuery } from '../../redux/uniformService/YarnTypeMasterServices';
import { useAddYarnMasterMutation, useDeleteYarnMasterMutation, useGetYarnMasterByIdQuery, useGetYarnMasterQuery, useUpdateYarnMasterMutation } from '../../redux/uniformService/YarnMasterServices';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import { DropdownInput, DropdownWithSearch, LongTextInput, MultiSelectDropdown, ReusableTable, TextInput, ToggleButton } from '../../Inputs';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { statusDropdown } from '../../Utils/DropdownData';
import { dropDownListObject, multiSelectOption } from '../../Utils/contructObject';
import { useGetCountsMasterQuery } from '../../redux/uniformService/CountsMasterServices';
import YarnBlendDetails from './YarnBlendDetails';
import { useDispatch, useSelector } from "react-redux";
import { setOpenPartyModal } from '../../redux/features/openModel';
import { push } from '../../redux/features/opentabs';
import { Check, Plus, Power } from 'lucide-react';
import Modal from '../../UiComponents/Modal';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { MultiSelect } from 'react-multi-select-component';
import { useGetHsnMasterQuery } from '../../redux/services/HsnMasterServices';
import { findFromList } from '../../Utils/helper';
const MODEL = 'Yarn Master'

export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const [id, setId] = useState("");
  const [aliasName, setAliasName] = useState("");
  const [name, setName] = useState("");
  const [yarnBlendDetails, setYarnBlendDetails] = useState([]);
  const [yarnTypeId, setYarnTypeId] = useState("");
  const [hsn, setHsn] = useState("");
  const [countsId, setCountsId] = useState("");
  const [contentId, setContentId] = useState();
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [countsList, setCountslist] = useState([])
  const [extra, setExtra] = useState("");
  const [taxPercent, setTaxPercent] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [yarnName, setYarnName] = useState("");

  const childRecord = useRef(0);

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )
  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  )
  const params = {
    companyId
  };

  const { data: contentList } =
    useGetContentMasterQuery({ params });

  const { data: YarnBlendList } =
    useGetYarnBlendMasterQuery({ params });

  const { data: YarnTypeList } =
    useGetYarnTypeMasterQuery({ params });

  const { data: countsData } =
    useGetCountsMasterQuery({ params });

  const { data: hsnData } =
    useGetHsnMasterQuery({ params });

  const { data: allData, isLoading, isFetching } = useGetYarnMasterQuery({ params, searchParams: searchValue });


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetYarnMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddYarnMasterMutation();
  const [updateData] = useUpdateYarnMasterMutation();
  const [removeData] = useDeleteYarnMasterMutation();

  const syncFormWithDb = useCallback((data) => {
    if (id) setAliasName(data?.aliasName ? data?.aliasName : "");
    setContentId(data?.contentId ? data?.contentId : "");
    setYarnBlendDetails(data?.YarnOnYarnBlend ? data?.YarnOnYarnBlend : [{ yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }]);
    setYarnTypeId(data?.yarnTypeId ? data?.yarnTypeId : "");
    setHsn(data?.hsnId ? data?.hsnId : "");
    setCountsId(data?.countsId ? data?.countsId : "");
    setTaxPercent(data?.taxPercent ? data?.taxPercent : 0);
    setActive(id ? (data?.active ? data.active : false) : true);
    setCountslist(
      data?.yarnCounts
        ? data?.yarnCounts?.map((item) => {
          return {
            value: item.value,
            label: item.name,
          };
        })
        : []
    );
  }, [id]);


  const dispatch = useDispatch();
  const openPartyModal = useSelector((state) => state.party.openPartyModal);
  const lastTapName = useSelector((state) => state.party.lastTab)

  const activeTab = useSelector((state) =>
    state.openTabs.tabs.find((tab) => tab.active).name
  );

  useEffect(() => {
    if (openPartyModal) {
      setId("");
      setForm(true);
    }
  }, [openPartyModal]);


  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    aliasName, contentId, name, hsn,
    yarnBlendDetails: yarnBlendDetails ? yarnBlendDetails.filter(item => item.yarnBlendId) : undefined, yarnTypeId, hsn, taxPercent,
    countsId, active, companyId, id, userId, countsList
  }

  const validatePercentage = () => {
    const yarnBlendPercentage = yarnBlendDetails.filter(blend => blend.yarnBlendId).reduce((accumulator, currentValue) => {
      return accumulator + parseInt(currentValue.percentage)
    }, 0);
    return yarnBlendPercentage === 100
  }

  function findName(arr, id) {
    if (!arr) return ""
    let data = arr?.find(item => parseInt(item.id) === parseInt(id))
    return data ? data.name : ""
  }


  useEffect(() => {

    const count = findName(countsData?.data, countsId);
    const content = findName(contentList?.data, contentId);
    const yarnType = findName(YarnTypeList?.data, yarnTypeId);

    const yarnBlend = yarnBlendDetails
      ?.filter(blend => blend.yarnBlendId && blend.percentage)
      .map(blend => `${parseInt(blend.percentage)}%${findName(YarnBlendList?.data, blend.yarnBlendId)}`)
      .join(", ") || "";

    console.log(count, content, yarnBlend, yarnType, "yarnBlend");
    // if (!count || !content || !yarnType) {
    //   setYarnName(""); // fallback if incomplete
    //   return;
    // }

    if (count || content || yarnType) {
      setAliasName(`${count} / ${content}${yarnBlend ? ` (${yarnBlend})` : ""} / ${yarnType}`);
      setName(`${count} / ${content}${yarnBlend ? ` (${yarnBlend})` : ""} / ${yarnType}`)
    } else {
      setAliasName(""); // optional, if you want to clear when any value is missing
    }
  }, [
    countsData,
    countsId,
    contentList,
    contentId,
    YarnTypeList,
    yarnTypeId,
    yarnBlendDetails,
    YarnBlendList
  ]);
  console.log(yarnName, "yarnName")

  // const yarnName = calculateYarnName();
  // setName(yarnName)
  // useEffect(() => {
  //   if (id) return
  //   setAliasName(calculateYarnName())
  // }, [calculateYarnName()])


  console.log(name, "name")

  console.log(aliasName, "aliasName")

  const validateData = (data) => {
    return data?.contentId && data?.countsId && data?.hsn
  }

  const handleSubmitCustom = async (callback, data, text, exit = false) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      setId("")
      onNew()
      // toast.success(text + "Successfully");
      Swal.fire({
        title: text + "Successfully",
        icon: "success",
        draggable: true,
        timer: 1000,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      setForm(false)
      if (exit) {
      }
      if (exit) {
        if (openPartyModal === true && lastTapName) {
          dispatch(push({ name: lastTapName }));
        }

        dispatch(setOpenPartyModal(false));
      }
    } catch (error) {
      console.log("handle");
    }
  };


  const saveData = () => {
    // if (!validatePercentage()) {
    //   const yarnBlendPercentage = yarnBlendDetails?.filter(blend => blend.yarnBlendId).reduce((accumulator, currentValue) => {
    //     return accumulator + parseInt(currentValue.percentage)
    //   }, 0);
    //   Swal.fire({
    //     title: `Total yarn blend is ${Number(yarnBlendPercentage.toFixed(2))}%. It must equal 100%`,
    //     icon: "success",
    //     draggable: true,
    //     timer: 1000,
    //     showConfirmButton: false,
    //     didOpen: () => {
    //       Swal.showLoading();
    //     }
    //   });
    //   return
    // }
    // if (!validateData(data)) {
    //   // toast.error("Please fill all required fields...!", { position: "top-center" })
    //   Swal.fire({
    //     title: "Please fill all required fields...!",
    //     icon: "success",
    //     draggable: true,
    //     timer: 1000,
    //     showConfirmButton: false,
    //     didOpen: () => {
    //       Swal.showLoading();
    //     }
    //   });
    //   return
    // }

    let foundItem;
    if (id) {
      foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item.name === name);
    } else {
      foundItem = allData?.data?.some(item => item.name === name);

    }


    if (foundItem) {
      Swal.fire({
        text: "The Yarn Name already exists.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
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
  }
  const saveExitData = () => {
    if (!validateData(data)) {
      toast.error("Please fill all required fields...!", {
        position: "top-center",
      });
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", true);
    } else {
      console.log("hit");
      handleSubmitCustom(addData, data, "Added", true);
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
        // toast.success("Deleted Successfully");
        Swal.fire({
          title: "Deleted" + "  " + "Successfully",
          icon: "success",
          draggable: true,
          timer: 1000,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
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
    setName("")
    setForm(true);
    setSearchValue("");
    setReadOnly(false);
    setAliasName("");
    setContentId("");
    setYarnTypeId("");
    setHsn("");
    setCountsId("");
    setTaxPercent(0);
    setActive(true);
    setCountslist([])

    setYarnBlendDetails([
      { yarnBlendId: "", percentage: "" },
      { yarnBlendId: "", percentage: "" },
      { yarnBlendId: "", percentage: "" },
      { yarnBlendId: "", percentage: "" },
    ]);
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
      header: "Yarn Name",
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

  const options =
    countsData?.data?.map((item) => ({
      value: item.id, // actual value
      label: item.name, // displayed name
    })) || [];
  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-2xl font-bold text-gray-800">Yarn  Master</h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Yarn
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
            widthClass={"w-[60%] h-[90%]"}
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
                        ? "Edit Yarn  Master"
                        : "Yarn  Master"
                      : "Add New Yarn "}
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

                          <fieldset className=' rounded mt-2 mb-5'>
                            <div className='grid grid-cols-2 gap-4'>
                              <DropdownInput name="Counts" options={dropDownListObject(id ? countsData?.data : countsData?.data?.filter(item => item.active), "name", "id")} value={countsId} setValue={(value) => { setCountsId(value); }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />

                              <DropdownWithSearch
                                options={contentList?.data}
                                value={contentId}
                                setValue={setContentId}
                                labelField={"name"}
                                label={"Content"}
                                required={true}
                              />
                            </div>

                            <YarnBlendDetails id={id} params={params} yarnBlend={yarnBlendDetails} setYarnBlend={setYarnBlendDetails} readOnly={readOnly} />

                            <div className='mt-3'>

                              <LongTextInput name="Yarn Name" className={'focus:outline-none  md:col-span-2 h-6 w-[500px] border border-gray-500 rounded'} type="text"
                                value={name}
                                disabled={(childRecord.current > 0)} />

                            </div>

                            <div className='mt-3'>
                              <TextInput name="Yarn Alias Name" type="text" value={aliasName} setValue={setAliasName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                            </div>


                            <div className=' grid grid-cols-2 '>
                              <div className='flex flex-grow gap-4 '>
                                <div className='col-span-1 w-full'>

                                  <DropdownWithSearch
                                    options={hsnData?.data}
                                    value={hsn}
                                    setValue={setHsn}
                                    labelField={"name"}
                                    label={"Hsn"}
                                    required={true}
                                  />
                                </div>
                                <div>
                                  <TextInput name="Tax" type="text" value={findFromList(hsn, hsnData?.data, "tax")} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                </div>
                              </div>

                            </div>



                            <div className="mt-5">
                              <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                            </div>

                          </fieldset>
                          <div>
                            <div className='h-[100px] mt-3'>
                              <MultiSelectDropdown
                                name="Counts List"
                                required={true}
                                options={multiSelectOption(countsData ? countsData?.data : [], "name", "id")}
                                selected={countsList}
                                setSelected={setCountslist} />
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



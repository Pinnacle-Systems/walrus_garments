import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { useGetContentMasterQuery } from '../../redux/uniformService/ContentMasterServices';
import { useGetYarnBlendMasterQuery } from '../../redux/uniformService/YarnBlendMasterServices';
import { useGetYarnTypeMasterQuery } from '../../redux/uniformService/YarnTypeMasterServices';
import { useAddYarnMasterMutation, useDeleteYarnMasterMutation, useGetYarnMasterByIdQuery, useGetYarnMasterQuery, useUpdateYarnMasterMutation } from '../../redux/uniformService/YarnMasterServices';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import { DropdownInput, LongTextInput, MultiSelectDropdown, ReusableTable, TextInput, ToggleButton } from '../../Inputs';
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

  const [taxPercent, setTaxPercent] = useState("");
  const [searchValue, setSearchValue] = useState("");

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
    setHsn(data?.hsn ? data?.hsn : "");
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

  console.log(lastTapName, "lastTapName")
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
    aliasName, contentId,name,
    yarnBlendDetails: yarnBlendDetails ? yarnBlendDetails.filter(item => item.yarnBlendId) : undefined, yarnTypeId, hsn, taxPercent,
    countsId, active, companyId, id, userId ,countsList
  }

  const validatePercentage = () => {
    const yarnBlendPercentage = yarnBlendDetails.filter(blend => blend.yarnBlendId).reduce((accumulator, currentValue) => {
      return accumulator + parseInt(currentValue.percentage)
    }, 0);
    return yarnBlendPercentage === 100
  }

  function findName(arr, id) {
    if (!arr) return ""
    let data = arr.find(item => parseInt(item.id) === parseInt(id))
    return data ? data.name : ""
  }

  const calculateYarnName = () => {
    let count = findName(countsList?.data, countsId)
    let content = findName(contentList?.data, contentId)
    let yarnType = findName(YarnTypeList?.data, yarnTypeId)

    let yarnBlend = yarnBlendDetails ?
      yarnBlendDetails?.filter(blend => blend.yarnBlendId && blend.percentage).map(blend => `${parseInt(blend.percentage)}%${findName(YarnBlendList?.data, blend.yarnBlendId)}`).join(' ') : "";

    if (!count || !content || !yarnType) return ""
    return `${count} / ${content} ( ${yarnBlend} )/ ${yarnType}`
  }

  useEffect(() => {
    if (id) return
    setAliasName(calculateYarnName())
  }, [calculateYarnName()])


  const validateData = (data) => {
    return data.aliasName && data.contentId && data.yarnTypeId &&
      data.hsn && data.countsId
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
      toast.success(text + "Successfully");
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
    console.log("click button work")
    // if (!validatePercentage()) {
    //     toast.error("Yarn Blend equal to 100...!", { position: "top-center" })
    //     return
    // }
    // if (!validateData(data)) {
    //     toast.error("Please fill all required fields...!", { position: "top-center" })
    //     return
    // }

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
      header: "Country Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-72",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },
    {
      header: "",
      accessor: (item) => "",
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 uppercase w-[65%]",
    },
  ];
  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-2xl font-bold text-gray-800">Yarn Type Master</h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Yarn Type
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
            widthClass={"w-[40%] h-[65%]"}
            onClose={() => {
              setForm(false);
              setErrors({});
            }}
          >
            <div className="h-full flex flex-col bg-[f1f1f0]">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Yarn Type Master"
                        : "Yarn Type Master"
                      : "Add New Yarn Type"}
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

              <div className="flex-1 overflow-auto p-3">
                <div className="grid grid-cols-1  gap-3  h-full">
                  <div className="lg:col-span- space-y-3">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                      <div className="space-y-4 ">
                        <div className="grid grid-cols-2  gap-3  h-full">

                          <fieldset className=' rounded mt-2 mb-5'>
                            <div className=''>
                              <div className="mb-3">
                                <TextInput name="Yarn Type" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                              </div>
                              <div className='h-20'>
                                <MultiSelectDropdown
                                  name="Counts List"
                                  required={true}
                                  options={multiSelectOption(countsData ? countsData?.data : [], "name", "id")}
                                  selected={countsList}
                                  setSelected={setCountslist} />
                              </div>
                              <div className="">
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
            </div>
          </Modal>
        )}
      </div>
    </div>
  )

}



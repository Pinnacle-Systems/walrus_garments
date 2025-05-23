import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import { useGetContentMasterQuery } from '../../redux/uniformService/ContentMasterServices';
import { useGetYarnBlendMasterQuery } from '../../redux/uniformService/YarnBlendMasterServices';
import { useGetYarnTypeMasterQuery } from '../../redux/uniformService/YarnTypeMasterServices';
import { useAddYarnMasterMutation, useDeleteYarnMasterMutation, useGetYarnMasterByIdQuery, useGetYarnMasterQuery, useUpdateYarnMasterMutation } from '../../redux/uniformService/YarnMasterServices';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import { DropdownInput, LongTextInput, Modal, TextInput, ToggleButton } from '../../Inputs';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { statusDropdown } from '../../Utils/DropdownData';
import { dropDownListObject } from '../../Utils/contructObject';
import { useGetCountsMasterQuery } from '../../redux/uniformService/CountsMasterServices';

import { useGetFabricMasterQuery } from '../../redux/uniformService/FabricMasterService';
import { useAddFiberContentMasterMutation, useDeleteFiberContentMasterMutation, useGetFiberContentMasterByIdQuery, useGetFiberContentMasterQuery, useUpdateFiberContentMasterMutation } from '../../redux/uniformService/FiberContentMasterServices';
import YarnBlendDetails from './YarnBlendDetails';

const MODEL = 'Fiber Content Master'

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

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )
  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
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
    if (id) setReadOnly(true);
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

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      setId(returnData.data.id)
      toast.success(text + "Successfully");
    } catch (error) {
      console.log("handle");
    }
  };


  const saveData = () => {

    // if (!validatePercentage()) {
    //   toast.error("Yarn Blend equal to 100...!", { position: "top-center" })
    //   return
    // }
    if (!validateData(data)) {
      toast.error("Please fill all required fields...!", { position: "top-center" })
      return
    }

    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  }

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id)
        setId("");
        onNew();
        toast.success("Deleted Successfully");
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

    return `${aliasName}/ ${fiberBlendDet} `
  }

  // useEffect(() => {
  //   if (id) return
  //   setFabricName(calculateFabricName())
  // }, [calculateFabricName()])

  console.log(allData, "alldataa")

  useEffect(() => {
    if (id) return
    setFabricName(calculateFabricName())
  }, [fiberBlend, aliasName])

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = ["S.NO", "Alias Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
  const tableDataNames = ["index+1", 'dataObj.aliasName', 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
  return (
    <div onKeyDown={handleKeyDown} className="p-4 space-y-4 w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold text-gray-800"> Fiber Content Master</h2>
        <button
          onClick={() => {
            setForm(true);
            onNew();
          }}
          className="bg-green-600 hover:bg-green-700 text-white rounded shadow transition"
        >
          + New
        </button>
      </div>

      {/* Table Section */}
      <div className="w-full">
        <Mastertable
          header="Fabric List"
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onDataClick={onDataClick}
          tableHeaders={tableHeaders}
          tableDataNames={tableDataNames}
          data={allData?.data}
          loading={isLoading || isFetching}
        />
      </div>

      {/* Modal Form */}
      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass="w-[90%] md:w-[70%] lg:w-[50%] h-[85%]"
          onClose={() => {
            setForm(false);
            setErrors({});
          }}
        >
          <MastersForm
            onNew={onNew}
            onClose={() => {
              setForm(false);
              setSearchValue('');
              setId(false);
            }}
            model={MODEL}
            saveData={saveData}
            setReadOnly={setReadOnly}
            deleteData={deleteData}
            readOnly={readOnly}
            emptyErrors={() => setErrors({})}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 w-full">
              {/* Left - Yarn Detail */}




              <fieldset className="border grid grid-cols-2 gap-x-10 w-full  rounded shadow-sm px-2 lg:col-span-2">
                <legend className="text-sm font-medium text-gray-700">Fabric Details</legend>



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


                <TextInput
                  readOnly
                  name="Fabric Name"
                  className="w-full"
                  type="text"
                  // value={calculateFabricName()}
                  value={fabricName}
                  disabled={childRecord.current > 0}
                />

              </fieldset>





              <div className="lg:col-span-2 border rounded  shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-4"> Blend Table</h3>
                <YarnBlendDetails
                  id={id}
                  params={params}
                  fiberBlend={fiberBlend}
                  setFiberBlend={setFiberBlend}
                  readOnly={readOnly}
                />
              </div>
            </div>

          </MastersForm>
        </Modal>
      )}

    </div>

  )
}



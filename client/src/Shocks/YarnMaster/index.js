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
import YarnBlendDetails from './YarnBlendDetails';

const MODEL = 'Yarn Master'

export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);

    const [id, setId] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [yarnBlendDetails, setYarnBlendDetails] = useState("");
    const [yarnTypeId, setYarnTypeId] = useState("");
    const [hsn, setHsn] = useState("");
    const [countsId, setCountsId] = useState("");
    const [contentId, setContentId] = useState();
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({});

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

    const { data: countsList } =
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
        if (id) setReadOnly(true);
        if (id) setAliasName(data?.aliasName ? data?.aliasName : "");
        setContentId(data?.contentId ? data?.contentId : "");
        setYarnBlendDetails(data?.YarnOnYarnBlend ? data?.YarnOnYarnBlend : [{ yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }]);
        setYarnTypeId(data?.yarnTypeId ? data?.yarnTypeId : "");
        setHsn(data?.hsn ? data?.hsn : "");
        setCountsId(data?.countsId ? data?.countsId : "");
        setTaxPercent(data?.taxPercent ? data?.taxPercent : 0);
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
        aliasName, contentId,
        yarnBlendDetails: yarnBlendDetails ? yarnBlendDetails.filter(item => item.yarnBlendId) : undefined, yarnTypeId, hsn, taxPercent,
        countsId, active, companyId, id, userId
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
         console.log("click button work")
        if (!validatePercentage()) {
            toast.error("Yarn Blend equal to 100...!", { position: "top-center" })
            return
        }
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
        // syncFormWithDb(undefined)
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const tableHeaders = ["S.NO", "Alias Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    const tableDataNames = ["index+1", 'dataObj.aliasName', 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    return (
        <div onKeyDown={handleKeyDown} className="p-4 space-y-4">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold text-gray-800"> Yarn Master</h2>
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
            header="Yarn Type List"
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
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
  {/* Left - Yarn Detail */}
  <fieldset className="border rounded shadow-sm ">
    <legend className="text-sm font-medium text-gray-700"> Yarn Details</legend>

    <TextInput
      readOnly
      name="Yarn Name"
      className="w-full"
      type="text"
      value={calculateYarnName()}
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

    <TextInput
      name="HSN Code"
      className="w-full"
      type="text"
      value={hsn}
      setValue={setHsn}
      readOnly={readOnly}
      required
      disabled={childRecord.current > 0}
    />
  </fieldset>

  {/* Right - Yarn Blend Detail */}
  <fieldset className="border rounded  shadow-sm ">
    <legend className="text-sm font-medium text-gray-700 "> Yarn Blend Details</legend>

    <DropdownInput
      name="Content"
      options={dropDownListObject(
        id ? contentList?.data : contentList?.data?.filter(i => i.active),
        'name',
        'id'
      )}
      value={contentId}
      setValue={setContentId}
      required
      readOnly={readOnly}
      disabled={childRecord.current > 0}
    />

    <DropdownInput
      name="Counts"
      options={dropDownListObject(
        id ? countsList?.data : countsList?.data?.filter(i => i.active),
        'name',
        'id'
      )}
      value={countsId}
      setValue={setCountsId}
      readOnly={readOnly}
      required
      disabled={childRecord.current > 0}
    />

    <DropdownInput
      name="Yarn Type"
      options={dropDownListObject(
        id ? YarnTypeList?.data : YarnTypeList?.data?.filter(i => i.active),
        'name',
        'id'
      )}
      value={yarnTypeId}
      setValue={setYarnTypeId}
      readOnly={readOnly}
      required
      disabled={childRecord.current > 0}
    />

    <TextInput
      name="Gst %"
      value={taxPercent}
      setValue={setTaxPercent}
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

  {/* Bottom - Blend Table */}
  <div className="lg:col-span-2 border rounded  shadow-sm">
    <h3 className="text-sm font-medium text-gray-700 mb-4"> Blend Table</h3>
    <YarnBlendDetails
      id={id}
      params={params}
      yarnBlend={yarnBlendDetails}
      setYarnBlend={setYarnBlendDetails}
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



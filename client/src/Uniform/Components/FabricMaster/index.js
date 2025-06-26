import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetFabricMasterQuery,
    useGetFabricMasterByIdQuery,
    useAddFabricMasterMutation,
    useUpdateFabricMasterMutation,
    useDeleteFabricMasterMutation,
} from "../../../redux/uniformService/FabricMasterService";
// import { useGetYarnBlendMasterQuery } from "../../../redux/uniformService/YarnBlendMasterServices";
// import { useGetFabricTypeMasterQuery } from "../../../redux/uniformService/FabricTypeMasterServices";
// import YarnBlendDetails from "../YarnMaster/YarnBlendDetails";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { LongTextInput, DropdownInput, LongDisabledInput, CheckBox, TextInput, ToggleButton } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { Check, Plus } from "lucide-react";
import Mastertable from "../../../Basic/components/MasterTable/Mastertable";
import Modal from "../../../UiComponents/Modal";
import { statusDropdown } from "../../../Utils/DropdownData";
const MODEL = "Fabric Master";


export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [yarnBlendDetails, setYarnBlendDetails] = useState("");
    const [fabricTypeId, setFabricTypeId] = useState("");
    const [hsn, setHsn] = useState("");
    const [active, setActive] = useState(true);
    const [organic, setOrganic] = useState(false)


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

    // const { data: YarnBlendList } =
    //     useGetYarnBlendMasterQuery({ params });

    // const { data: FabricTypeList } =
    //     useGetFabricTypeMasterQuery({ params });


    const { data: allData, isLoading, isFetching } = useGetFabricMasterQuery({ params, searchParams: searchValue });


    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetFabricMasterByIdQuery(id, { skip: !id });

    const [addData] = useAddFabricMasterMutation();
    const [updateData] = useUpdateFabricMasterMutation();
    const [removeData] = useDeleteFabricMasterMutation();

    const syncFormWithDb = useCallback((data) => {
        if (id) setReadOnly(true);
        setAliasName(data?.aliasName ? data?.aliasName : "");
        // setYarnBlendDetails(data?.FabricOnYarnBlend ? data?.FabricOnYarnBlend : [{ yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }]);
        // setFabricTypeId(data?.fabricTypeId ? data?.fabricTypeId : "");
        // setHsn(data?.hsn ? data?.hsn : "");
        // setName(data?.name ? data.name : "");
        setActive(id ? (data?.active ? data.active : false) : true);
        // setOrganic(data?.organic ? data.organic : false);
    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        aliasName,
        active,
        companyId, id, userId
    }

    const validatePercentage = () => {
        // const yarnBlendPercentage = yarnBlendDetails.filter(blend => blend.yarnBlendId).reduce((accumulator, currentValue) => {
        //     return accumulator + parseInt(currentValue.percentage)
        // }, 0);
        // return yarnBlendPercentage === 100
    }

    function findName(arr, id) {
        if (!arr) return ""
        let data = arr.find(item => parseInt(item.id) === parseInt(id))
        return data ? data.name : ""
    }

    const calculateYarnName = () => {
        //     let fabricType = findName(FabricTypeList?.data, fabricTypeId)

        //     let yarnBlend = yarnBlendDetails ?
        //         yarnBlendDetails?.filter(blend => blend.yarnBlendId && blend.percentage).map(blend => `${parseInt(blend.percentage)}%${findName(YarnBlendList?.data, blend.yarnBlendId)}`).join(' ') : "";

        //     if (!fabricType) return ""
        //     return `( ${yarnBlend} )/ ${fabricType}`
    }

    useEffect(() => {
        if (id) return
        setAliasName(calculateYarnName())
    }, [calculateYarnName()])


    const validateData = (data) => {
        if (data?.aliasName) {
            return true;
        }
        return false;

    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData;
            if (text == "Updated") {
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

        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" })
            return
        }
        // if (!validatePercentage()) {
        //     toast.info("Yarn Blend equal to 100...!", { position: "top-center" })
        //     return
        // }
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
    const tableHeaders = ["Name", "Status"]
    const tableDataNames = ['dataObj.aliasName', 'dataObj.active ? ACTIVE : INACTIVE']


    // return (
    //     <div
    //         onKeyDown={handleKeyDown}
    //         className="md:items-start md:justify-items-center grid h-full bg-theme"
    //     >

    //         <div className="flex flex-col frame w-full h-full">
    //             <FormHeader
    //                 onNew={onNew}
    //                 onClose={() => {
    //                     setForm(false);
    //                     setSearchValue("");
    //                 }}
    //                 model={MODEL}
    //                 saveData={saveData}
    //                 setReadOnly={setReadOnly}
    //                 deleteData={deleteData}

    //             />
    //             <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
    //                 <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
    //                     <div className='col-span-3 grid md:grid-cols-2 border overflow-auto'>
    //                         <div className='mr-1 md:ml-2'>
    //                             <fieldset className='frame my-1'>
    //                                 <legend className='sub-heading'>Fabric Info</legend>
    //                                 <div className='flex flex-col justify-start gap-3 flex-1'>
    //                                     <div className="grid grid-cols-2">
    //                                         <TextInput name="FabricName" type="text" value={aliasName} setValue={setAliasName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />


    //                                         <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
    //                                     </div>
    //                                 </div>
    //                             </fieldset>
                         
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div className="frame overflow-x-hidden">
    //                     <FormReport
    //                         searchValue={searchValue}
    //                         setSearchValue={setSearchValue}
    //                         setId={setId}
    //                         tableHeaders={tableHeaders}
    //                         tableDataNames={tableDataNames}
    //                         data={allData?.data}
    //                         loading={
    //                             isLoading || isFetching
    //                         }
    //                     />
    //                 </div>
    //             </div>
    //         </div>

    //     </div>
    // );

        return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Fabric Master</h5>
                    <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                setForm(true);
                                onNew();
                                }}
                                className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Fabric Master 
                            </button>
                    
                    </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Fabric list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                    data={allData?.data}
                // loading={
                //     isLoading || isFetching
                // }
                />
            </div>
      
        {form && (
                                    <Modal
                                        isOpen={form}
                                        form={form}
                                        widthClass={"w-[35%] max-w-6xl h-[40vh]"}
                                        onClose={() => {
                                        setForm(false);
                                        // setErrors({});
                                        }}
                                    >
                                        <div className="h-full flex flex-col bg-[f1f1f0]">
                                        <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
                                            <div className="flex items-center gap-2">
                                            <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                                                {id ? (!readOnly ? "Edit Fabric" : "Fabric Master ") : "Add New Fabric"}
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
                                    <fieldset className=' my-1'>
                                     <div className='flex flex-col justify-start gap-3 flex-1'>
                                        <div className="grid grid-cols-2">
                                             <TextInput name="FabricName" type="text" value={aliasName} setValue={setAliasName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                         </div>
                                          <div className='mb-5'>
                                            <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                        </div>
                                     </div>
                                 </fieldset>
                                           

                                            </div>
                                        </div>
                                </div>
                                                
                                


                                            





                                    </Modal>
            )}
        </div>
    )
}

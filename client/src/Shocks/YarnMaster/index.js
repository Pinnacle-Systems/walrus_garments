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

    // const { data: countsList } =
    //     useGetCountsMasterQuery({ params });
    let countsList;

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
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Yarn Type Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Yarn Type list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    loading={
                        isLoading || isFetching
                    } />
            </div>
            {form === true && <Modal isOpen={form} form={form} widthClass={"w-[70%] h-[80%]"} onClose={() => { setForm(false); setErrors({}); }}>
                <MastersForm
                    onNew={onNew}
                    onClose={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                    }}
                    model={MODEL}
                    // childRecord={childRecord.current}
                    saveData={saveData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                    readOnly={readOnly}
                    emptyErrors={() => setErrors({})}
                >
                    <div className=''>
                        <fieldset className=' w-[100%] h-[60%]'>
                            <div className='mb-3'>Yarn Blend Details</div>
                            <div className='overflow-y-auto flex justify-between'>
                                <div className="md:grid md:grid-cols-2 gap-x-3 w-[48%]">
                                    <div className='mb-3'>
                                        <DropdownInput name="Content" options={dropDownListObject(id ? contentList.data : contentList.data.filter(item => item.active), "name", "id")} value={contentId} setValue={(value) => { setContentId(value); }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    </div>
                                    <div className='mb-3'>
                                        <DropdownInput name="Counts" options={dropDownListObject(id ? countsList.data : countsList.data.filter(item => item.active), "name", "id")} value={countsId} setValue={(value) => { setCountsId(value); }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                    </div>
                                    <div className='mb-3'>
                                        <DropdownInput name="Yarn Type" options={dropDownListObject(id ? YarnTypeList.data : YarnTypeList.data.filter(item => item.active), "name", "id")} value={yarnTypeId} setValue={(value) => { setYarnTypeId(value); }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                    </div>
                                    <div className='mb-3'>
                                        <TextInput name={"Gst %"} value={taxPercent} setValue={setTaxPercent} readOnly={readOnly} required disabled={(childRecord.current > 0)} />
                                    </div>
                                    <div className='mb-3'>
                                        <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                    </div>

                                </div>
                                <div className='w-[50%]'>
                                    <yarnBlendDetails id={id} params={params} yarnBlend={yarnBlendDetails} setYarnBlend={setYarnBlendDetails} readOnly={readOnly} />
                                </div>

                            </div>
                        </fieldset>
                        <fieldset className='overflow-auto  border-gray-600 w-[100%]'>
                            <div className='mb-3'>Yarn Details</div>
                            <div className='w-full'>
                                <div className='mb-3'>
                                    <LongTextInput readOnly name="Yarn Name" className={'focus:outline-none cursor-not-allowed md:col-span-2 h-6 py-1  rounded'} type="text" value={calculateYarnName()} disabled={(childRecord.current > 0)} />
                                </div>

                                <div className="mb-3">
                                    <LongTextInput name="Alias Name" className={'focus:outline-none md:col-span-2 h-6 py-1  rounded'} type="text" value={aliasName} setValue={setAliasName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                </div>
                                <div className='mb-3 w-[20%]'>
                                    <LongTextInput name="HSN Code" className={'focus:outline-none md:col-span-2 h-6 py-1 border rounded'} type="text" value={hsn} setValue={setHsn} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                </div>


                            </div>
                        </fieldset>
                    </div>


                </MastersForm>
            </Modal>}

        </div>
    )
}



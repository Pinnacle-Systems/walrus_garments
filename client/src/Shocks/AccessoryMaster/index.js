import React, { useCallback, useEffect, useRef, useState } from 'react'

import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import secureLocalStorage from 'react-secure-storage';
import { useGetAccessoryItemMasterQuery } from '../../redux/uniformService/AccessoryItemMasterServices';
import { useGetAccessoryGroupMasterQuery } from '../../redux/uniformService/AccessoryGroupMasterServices';
import { useAddAccessoryMasterMutation, useDeleteAccessoryMasterMutation, useGetAccessoryMasterByIdQuery, useGetAccessoryMasterQuery, useUpdateAccessoryMasterMutation } from '../../redux/uniformService/AccessoryMasterServices';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { DropdownInput, LongTextInput, Modal, ToggleButton } from '../../Inputs';
import { accessoryCategoryList, statusDropdown } from '../../Utils/DropdownData';
import { dropDownListObject } from '../../Utils/contructObject';


const MODEL = "Accessory Master"

export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);

    const [id, setId] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [yarnBlendDetails, setYarnBlendDetails] = useState("");
    const [accessoryItemId, setAccessoryItemId] = useState("");
    const [hsn, setHsn] = useState("");
    const [accessoryGroupId, setAccessoryGroupId] = useState("");
    const [accessoryCategory, setAccessoryCategory] = useState();
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({});


    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);
    const dispatch = useDispatch();



    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )
    const params = {
        companyId
    };

    // const { data: contentList } =
    //     useGetContentMasterQuery({ params: { ...params, active: true } });

    // const { data: YarnBlendList } =
    //     useGetYarnBlendMasterQuery({ params: { ...params, active: true } });

    const { data: accessoryItemList } =
        useGetAccessoryItemMasterQuery({ params });

    const { data: accessoryGroupList } =
        useGetAccessoryGroupMasterQuery({ params });


    const { data: allData, isLoading, isFetching } = useGetAccessoryMasterQuery({ params, searchParams: searchValue });


    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetAccessoryMasterByIdQuery(id, { skip: !id });

    const [addData] = useAddAccessoryMasterMutation();
    const [updateData] = useUpdateAccessoryMasterMutation();
    const [removeData] = useDeleteAccessoryMasterMutation();

    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            setReadOnly(false);
            setAliasName("");
            setAccessoryCategory("");
            setAccessoryItemId("");
            setHsn("");
            setAccessoryGroupId("");
                  setActive(id ? (data?.active ) : true);

        } else {
            setReadOnly(true);
            setAliasName(data?.aliasName || "");
            setAccessoryCategory(data?.accessoryCategory || "");
            setAccessoryItemId(data?.accessoryItemId || "");
            setHsn(data?.hsn || "");
            setAccessoryGroupId(data?.accessoryItem.accessoryGroupId || "");
            setActive(id ? (data?.active ?? false) : true);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        aliasName, accessoryCategory,
        accessoryItemId, hsn, accessoryGroupId, active, companyId, id, userId
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
        let group = findName(accessoryGroupList?.data, accessoryGroupId)
        let category = accessoryCategoryList.find(item => item.value === accessoryCategory)?.show
        let item = findName(accessoryItemList?.data, accessoryItemId)

        // let yarnBlend = yarnBlendDetails ?
        //     yarnBlendDetails?.filter(blend => blend.yarnBlendId && blend.percentage).map(blend => `${parseInt(blend.percentage)}%${findName(YarnBlendList?.data, blend.yarnBlendId)}`).join(' ') : "";

        if (!group || !category || !item) return ""
        return `${category} / ${group} / ${item}`
    }

    useEffect(() => {
        if (id) return
        setAliasName(calculateYarnName())
    }, [calculateYarnName()])


    const validateData = (data) => {
        return data.aliasName && data.accessoryCategory && data.accessoryItemId && data.accessoryGroupId &&
            data.hsn
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
            dispatch({
                type: `AccessoryGroupMaster/invalidateTags`,
                payload: ['Accessory Group'],
            });
        } catch (error) {
            console.log("handle");
        }
    };


    const saveData = () => {
        // if (!validatePercentage()) {
        //     toast.error("Yarn Blend equal to 100...!", { position: "top-center" })
        //     return
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
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    toast.error(deldata?.message)
                    return
                }
                setId("");
                dispatch({
                    type: `AccessoryGroupMaster/invalidateTags`,
                    payload: ['Accessory Group'],
                });
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

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const tableHeaders = ["S.NO", "Alias Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    const tableDataNames = ["index+1", 'dataObj.aliasName', 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Accessory Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Accessory list'}
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
            {form === true && <Modal isOpen={form} form={form} widthClass={"w-[45%] h-[90%]"} onClose={() => { setForm(false); setErrors({}); }}>
                <MastersForm
                    onNew={onNew}
                    onClose={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                    }}
                    model={MODEL}
                    childRecord={childRecord.current}
                    saveData={saveData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                    readOnly={readOnly}
                    emptyErrors={() => setErrors({})}
                >
                    <fieldset className='mb-3'>
                        <div className='sub-heading'>Accessories</div>
                        <div className='flex justify-between gap-3'>
                            <div className="mb-3 w-[48%] mt-2">
                                <DropdownInput
                                    name="Accessory Category"
                                    options={accessoryCategoryList}
                                    value={accessoryCategory}
                                    setValue={setAccessoryCategory}
                                    required={true}
                                    readOnly={readOnly}
                                    disabled={(childRecord.current > 0)}
                                />
                            </div>
                            <div className="mb-3 w-[48%] mt-2">
                                <DropdownInput name="Accessory Group" options={dropDownListObject(id ? accessoryGroupList?.data : accessoryGroupList?.data?.filter(item => item.active), "name", "id")} value={accessoryGroupId} setValue={(value) => { setAccessoryGroupId(value); }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                            </div>
                        </div>
                        <div className="mb-3 w-[48%]">
                            <DropdownInput name="Accessory Item" options={dropDownListObject(id ? accessoryItemList?.data?.filter(item => parseInt(accessoryGroupId) === parseInt(item.accessoryGroupId)) : accessoryItemList?.data?.filter(item => parseInt(accessoryGroupId) === parseInt(item.accessoryGroupId)).filter(item => item.active), "name", "id")} value={accessoryItemId} setValue={(value) => { setAccessoryItemId(value) }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                        </div>

                        <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />


                    </fieldset>
                    <fieldset className='mb-5'>
                        <div className=''>Accessory Details</div>
                        <div className=''>
                            <LongTextInput readOnly name="Accessory Name" className={'focus:outline-none cursor-not-allowed md:col-span-2 h-6 mb-1 rounded'} type="text" value={calculateYarnName()} disabled={(childRecord.current > 0)} />
                            <div className="">
                                <LongTextInput name="Alias Name" className={'focus:outline-none md:col-span-2 h-6 mb-1 border border-gray-500 rounded w-[75%]'} type="text" value={aliasName} setValue={setAliasName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                <LongTextInput name="HSN Code" className={'focus:outline-none md:col-span-2 h-6  border border-gray-500 rounded w-[15%]'} type="text" value={hsn} setValue={setHsn} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                            </div>
                        </div>
                    </fieldset>
                </MastersForm>
            </Modal>}

        </div>
    )
}


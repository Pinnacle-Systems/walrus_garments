import React, { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import secureLocalStorage from 'react-secure-storage';
import { useGetPartyQuery } from '../../redux/services/PartyMasterService';
import { useGetAccessoryGroupMasterQuery } from '../../redux/uniformService/AccessoryGroupMasterServices';
import { useAddAccessoryItemMasterMutation, useDeleteAccessoryItemMasterMutation, useGetAccessoryItemMasterByIdQuery, useGetAccessoryItemMasterQuery, useUpdateAccessoryItemMasterMutation } from '../../redux/uniformService/AccessoryItemMasterServices';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { DropdownInput, Modal, TextInput, ToggleButton } from '../../Inputs';
import PartySupplyDetails from './PartySupplyDetails';
import { statusDropdown } from '../../Utils/DropdownData';
import { dropDownListObject } from '../../Utils/contructObject';



const MODEL = "Access Item Master"
export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [accessoryGroupId, setAccessoryGroupId] = useState("")
    const [active, setActive] = useState(true);
    const [partySuppliesItem, setPartySuppliesItem] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [errors, setErrors] = useState({});
    const childRecord = useRef(0);

    const dispatch = useDispatch()

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const params = {
        companyId
    };
    const { data: partyData, isLoading: isPartyLoading, isFetching: isPartyFetching } = useGetPartyQuery(params)


    const { data: AccessoryGroupList } =
        useGetAccessoryGroupMasterQuery({ params });

    const { data: allData, isLoading, isFetching, refetch } = useGetAccessoryItemMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetAccessoryItemMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddAccessoryItemMasterMutation();
    const [updateData] = useUpdateAccessoryItemMasterMutation();
    const [removeData] = useDeleteAccessoryItemMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setName("");
                setAccessoryGroupId("");
                setActive(id ? (data?.active ?? true) : false);
                setPartySuppliesItem([])
            } else {
                setReadOnly(true);
                setName(data?.name || "");
                setAccessoryGroupId(data?.accessoryGroupId || "");
                setActive(id ? (data?.active ?? false) : true);
                setPartySuppliesItem(data?.PartyOnAccessoryItems ? data?.PartyOnAccessoryItems.map(item => item.partyId) : [])
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, accessoryGroupId, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        partySuppliesItem
    }

    const validateData = (data) => {
        if (data.name && data.accessoryGroupId) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            dispatch({
                type: `partyMaster/invalidateTags`,
                payload: ['Party'],
            });
            toast.success(text + "Successfully");
        } catch (error) {
            console.log("handle");
        }
    };

    const saveData = () => {
        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", {
                position: "top-center",
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
                dispatch({
                    type: `partyMaster/invalidateTags`,
                    payload: ['Party'],
                });
                setId("");
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
        syncFormWithDb(undefined)
        setReadOnly(false);
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const tableHeaders = [
        "S.NO", "Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
    const tableDataNames = ["index+1", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Access Item Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Access Item list'}
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
            {form === true && <Modal isOpen={form} form={form} widthClass={"w-[70%] h-[95%]"} onClose={() => { setForm(false); setErrors({}); }}>
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

                    <div className='h-[70%]'>
                        <div className=''>
                            <fieldset className=' my-1'>
                                <div className=''>Accessory Item Info</div>
                                <div className='flex my-2 gap-10  items-center'>
                                    <div className='mb-3'>
                                        <TextInput className={"text-sm"} name="Item Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    </div>
                                    <div className='mb-3'>
                                        <DropdownInput className={"text-sm"} name="Item Type" options={dropDownListObject(id ? AccessoryGroupList?.data : AccessoryGroupList?.data?.filter(item => item.active), "name", "id")} value={accessoryGroupId} setValue={(value) => { setAccessoryGroupId(value); }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    </div>
                                    <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                </div>

                            </fieldset>
                        </div>
                        <div className='h-[40%]'>
                            <fieldset className=' my-1 border-gray-500  h-full'>
                                <div className=''>Party Supply Details</div >
                                <div className='h-[40%] my-2 justify-items-center items-center '>
                                    <PartySupplyDetails readOnly={readOnly} partySuppliesItem={partySuppliesItem} setPartySuppliesItem={setPartySuppliesItem}
                                        partyDetails={partyData ? partyData.data : []} />
                                </div>
                            </fieldset>
                        </div>
                    </div>

                </MastersForm>
            </Modal>}

        </div>
    )
}


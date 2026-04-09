import React, { useEffect, useState, useRef, useCallback } from "react";

import secureLocalStorage from "react-secure-storage";
import {
    useGetPartyQuery,
    useGetPartyByIdQuery,
    useAddPartyMutation,
    useUpdatePartyMutation,
    useDeletePartyMutation,
} from "../../../redux/services/PartyMasterService";

import { useGetCityQuery } from "../../../redux/services/CityMasterService";
import PartyOnItems from "./PartyOnItems";

import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, DropdownInput, CheckBox, RadioButton, TextArea, DateInput, MultiSelectDropdown, DropdownWithSearch } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { dropDownListObject, dropDownListMergedObject, multiSelectOption } from '../../../Utils/contructObject';
import moment from "moment";
import Modal from "../../../UiComponents/Modal";

import { Loader } from '../../../Basic/components';
import { useDispatch } from "react-redux";
import { findFromList } from "../../../Utils/helper";
import { useGetProductQuery } from "../../../redux/services/ProductMasterService";
import { DELETE, PLUS } from "../../../icons";
import { faTrashCan, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PartyLogoUpload from "./PartyLogoUpload";
import { useGetAccessoryItemMasterQuery } from "../../../redux/uniformService/AccessoryItemMasterServices";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";


const MODEL = "Party Master";


const Party = ({ setPartyFormOpen, setLeadPageOpen, leadPageOpen, isLead = false }) => {

    const [processDetails, setProcessDetails] = useState([]);
    const [form, setForm] = useState(false);
    const [isPartyLogoOpen, setIsPartyLogoOpen] = useState(false);
    const [logo, setLogo] = useState("")
    const [readOnly, setReadOnly] = useState(false);
    const [accessoryGroup, setAccessoryGroup] = useState(false);
    const [id, setId] = useState("");
    const [panNo, setPanNo] = useState("");
    const [name, setName] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [tinNo, setTinNo] = useState("");
    const [cstNo, setCstNo] = useState("");
    const [cinNo, setCinNo] = useState("");
    const [faxNo, setFaxNo] = useState("");
    const [website, setWebsite] = useState("");
    const [code, setCode] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [contactPersonName, setContactPersonName] = useState("");
    const [gstNo, setGstNo] = useState("");
    const [costCode, setCostCode] = useState("");
    const [contactMobile, setContactMobile] = useState('');
    const [cstDate, setCstDate] = useState("");
    const [email, setEmail] = useState("");
    const [isSupplier, setIsSupplier] = useState(true);
    const [isBuyer, setIsBuyer] = useState(true);
    const [isClient, setIsClient] = useState(true);
    const [active, setActive] = useState(true);
    const [priceDetails, setPriceDetails] = useState([]);
    const [isIgst, setIsIgst] = useState(false)
    const [shippingAddress, setShippingAddress] = useState([])
    const [contactDetails, setContactDetails] = useState([]);
    const [yarn, setYarn] = useState(true);
    const [fabric, setFabric] = useState(true);
    const [accessoryItemList, setAccessoryItemList] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [itemsPopup, setItemsPopup] = useState(false);
    const [backUpItemsList, setBackUpItemsList] = useState([]);

    const [accessoryGroupPrev, setAccessoryGroupPrev] = useState(false);
    const childRecord = useRef(0);
    const dispatch = useDispatch()


    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )
    const params = {
        companyId
    };
    const { data: cityList, isLoading: cityLoading, isFetching: cityFetching } =
        useGetCityQuery({ params });


    const { data: accessoryItemsMasterList, isLoading: isItemsLoading, isFetching: isItemsFetching } = useGetAccessoryItemMasterQuery({ companyId })

    const { data: allData, isLoading, isFetching } = useGetPartyQuery({ params, searchParams: searchValue });
    const { data: processList, isLoading: isProcessLoading, isFetching: isProcessFetching } = useGetProcessMasterQuery({ params });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetPartyByIdQuery(id, { skip: !id });

    const [addData] = useAddPartyMutation();
    const [updateData] = useUpdatePartyMutation();
    const [removeData] = useDeletePartyMutation();



    function handleInputChange(value, index, field) {
        const newBlend = structuredClone(priceDetails);
        newBlend[index][field] = value;

        setPriceDetails(newBlend);
    };

    function handleInputAddress(value, index, field) {
        const newBlend = structuredClone(shippingAddress);
        newBlend[index][field] = value;
        setShippingAddress(newBlend)
    }


    function deleteRow(index) {
        setPriceDetails(prev => prev.filter((_, i) => i !== index))
    }
    function addNewRow() {
        setPriceDetails(prev => [
            ...prev,
            { productId: "", price: "0" }
        ]);
    }

    function deleteAddress(index) {
        setShippingAddress(prev => prev.filter((_, i) => i !== index))
    }
    function addNewAddress() {
        setShippingAddress(prev =>
            [...prev,
            { address: "" }]
        );
    }

    useEffect(() => {
        if (priceDetails.length >= 5) return
        setPriceDetails(prev => {
            let newArray = Array.from({ length: 5 - prev.length }, i => {
                return { productId: "", price: "0" }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setPriceDetails, priceDetails])




    const syncFormWithDb = useCallback((data) => {
        if (id) {
            setReadOnly(true);
        } else {
            setReadOnly(false);
        }
        setPanNo(data?.panNo ? data?.panNo : "");
        setName(data?.name ? data?.name : "");

        setAliasName(data?.aliasName ? data?.aliasName : "");
        setContactDetails(data?.contactDetails ? data?.contactDetails : [])
        setDisplayName(data?.displayName ? data?.displayName : "");
        setAddress(data?.address ? data?.address : "");
        setTinNo(data?.tinNo ? data?.tinNo : "");
        setCstNo(data?.cstNo ? data?.cstNo : "");
        setCinNo(data?.cinNo ? data?.cinNo : "");
        setFaxNo(data?.faxNo ? data?.faxNo : "");
        setCinNo(data?.cinNo ? data?.cinNo : "");
        setContactPersonName(data?.contactPersonName ? data?.contactPersonName : "");
        setGstNo(data?.gstNo ? data?.gstNo : "");
        setCostCode(data?.costCode ? data?.costCode : "");
        setCstDate(data?.cstDate ? moment.utc(data?.cstDate).format('YYYY-MM-DD') : "");
        setCode(data?.code ? data?.code : "");
        setPincode(data?.pincode ? data?.pincode : "");
        setWebsite(data?.website ? data?.website : "");
        setEmail(data?.email ? data?.email : "");
        setCity(data?.cityId ? data?.cityId : "");
        setIsBuyer((data?.isBuyer ? data.isBuyer : false));
        setIsSupplier((data?.isSupplier ? data.isSupplier : false));
        setIsClient((data?.isClient ? data.isClient : false));
        setActive(id ? (data?.active ? data.active : false) : true);
        setShippingAddress(data?.ShippingAddress ? data?.ShippingAddress : [])
        setContactMobile((data?.contactMobile ? data.contactMobile : ''));
        setPriceDetails(data?.PriceDetails ? data?.PriceDetails : [])
        setIsIgst(data?.isIgst ? data?.isIgst : false);
        setLogo(data?.logo ? data?.logo : null);
        setYarn((data?.yarn ? data.yarn : false));
        setFabric((data?.fabric ? data.fabric : false));
        setAccessoryGroup((data?.accessoryGroup ? data.accessoryGroup : false));
        setProcessDetails(data?.PartyOnProcess
            ?
            data.PartyOnProcess.map(item => {
                return { value: parseInt(item.processId), label: findFromList(item.processId, processList?.data, "name") }
            })
            :
            [])
        setAccessoryItemList((data?.PartyOnAccessoryItems ? data.PartyOnAccessoryItems.map(item => parseInt(item.accessoryItemId)) : []))
    }, [id]);

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);



    const data = {
        name, isIgst, isSupplier, isBuyer, isClient, code, aliasName, displayName, address, cityId: city, pincode, panNo, tinNo, cstNo, cstDate, cinNo,
        faxNo, email, website, contactPersonName, gstNo, costCode, contactMobile, shippingAddress,
        active, companyId, contactDetails, logo, yarn, fabric, accessoryGroup,
        accessoryItemList,
        priceDetails: priceDetails.filter(item => item.price != 0),
        processDetails: processDetails ? processDetails.map(item => item.value) : undefined,

        id, userId
    }

    const validateData = (data) => {
        return data.name

    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id, body: data }).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            dispatch({
                type: `accessoryItemMaster/invalidateTags`,
                payload: ['AccessoryItemMaster'],
            });
            dispatch({
                type: `CityMaster/invalidateTags`,
                payload: ['City/State Name'],
            });
            dispatch({
                type: `CurrencyMaster/invalidateTags`,
                payload: ['Currency'],
            });
            setId("")
            syncFormWithDb(undefined)
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
                dispatch({
                    type: `accessoryItemMaster/invalidateTags`,
                    payload: ['AccessoryItemMaster'],
                });
                setId("");
                dispatch({
                    type: `CityMaster/invalidateTags`,
                    payload: ['City/State Name'],
                });
                dispatch({
                    type: `CurrencyMaster/invalidateTags`,
                    payload: ['Currency'],
                });
                syncFormWithDb(undefined);
                toast.success("Deleted Successfully");
            } catch (error) {
                toast.error("something went wrong");
            }
        }
    };


    function handleGroupRadioButton(e) {
        setAccessoryGroup(e.target.checked);
    }

    function handleItemRadioButton(e) {
        if (accessoryGroup) setAccessoryItemList([]);
        setAccessoryGroupPrev(accessoryGroup);
        setAccessoryGroup(!e.target.checked);
        setItemsPopup(true);
    }

    useEffect(() => {
        if (itemsPopup) {
            setBackUpItemsList(accessoryItemList);
        }
    }, [itemsPopup])
    useEffect(() => {
        if (accessoryGroup) {
            if (accessoryItemsMasterList) {
                setAccessoryItemList(accessoryItemsMasterList.data.map(item => parseInt(item.id)))
            }
        }
    }, [accessoryGroup, isItemsFetching, isItemsLoading, accessoryItemsMasterList])

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };

    const onNew = () => {
        setReadOnly(false);
        setForm(true);
        setSearchValue("");
        setId("");
        syncFormWithDb(undefined);
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    function removeItem(index) {
        setContactDetails(contactDetails => {
            return contactDetails.filter((_, i) => parseInt(i) !== parseInt(index))
        });
    }

    const tableHeaders = ["Name", "Alias Name"]
    const tableDataNames = ["dataObj.name", 'dataObj.aliasName']



    if (!form)
        return (
            <ReportTemplate
                heading={MODEL}
                tableHeaders={tableHeaders}
                tableDataNames={tableDataNames}
                loading={
                    isLoading || isFetching
                }
                setForm={setForm}
                data={allData?.data}
                onClick={onDataClick}
                isLead={isLead}
                onClose={() => {

                    setPartyFormOpen(false)
                }}


                onNew={onNew}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
            />
        );


    // if (!cityList || cityFetching || cityLoading) {
    //     return <Loader />
    // }

    return (
        <div
            onKeyDown={handleKeyDown}
            className="md:items-start md:justify-items-center grid h-full bg-theme"
        >
            <Modal isOpen={isPartyLogoOpen} onClose={() => setIsPartyLogoOpen(false)} widthClass={"px-2 h-[55%] w-[35%] "}>
                <PartyLogoUpload logo={logo} setLogo={setLogo} id={id} setIsPartyLogoOpen={setIsPartyLogoOpen} />
            </Modal>

            <Modal isOpen={itemsPopup} onClose={
                () => {
                    setAccessoryGroup(accessoryGroupPrev);
                    setAccessoryItemList(structuredClone(backUpItemsList));
                    setItemsPopup(false);
                }} widthClass={"w-[600px] h-[500px] overflow-auto flex justify-start item-center bg-blue-100 p-10"}>
                <PartyOnItems readOnly={readOnly} setItemsPopup={setItemsPopup}
                    accessoryItemsMasterList={accessoryItemsMasterList} accessoryItemList={accessoryItemList} setAccessoryItemList={setAccessoryItemList} />
            </Modal>

            <div className="flex flex-col frame w-full h-full">
                <FormHeader
                    onNew={onNew}
                    onClose={() => {
                        setForm(false);
                        setSearchValue("");


                    }}
                    model={MODEL}
                    saveData={saveData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}


                />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2">
                    <div className="col-span-3 grid md:grid-cols-2 border h-[520px] overflow-auto">
                        <div className='col-span-3 grid md:grid-cols-2 border'>
                            <div className='mr-1 md:ml-2'>
                                <div className="flex mt-2">
                                    <CheckBox name="Is Supplier" readOnly={readOnly} value={isSupplier} setValue={setIsSupplier} />
                                    <CheckBox name="Is Buyer" readOnly={readOnly} value={isBuyer} setValue={setIsBuyer} />
                                    {/* <CheckBox name="Is Client" readOnly={readOnly} value={isClient} setValue={setIsClient} /> */}
                                    <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
                                    <CheckBox name="IGST" readOnly={readOnly} value={isIgst} setValue={setIsIgst} />
                                    <CheckBox name="Yarn" readOnly={readOnly} value={yarn} setValue={setYarn} />
                                    <CheckBox name="Fabric" readOnly={readOnly} value={fabric} setValue={setFabric} />

                                </div>

                                <div className="grid items-center justify-items-center mt-3 text-xs">
                                    <h2 className='font-semibold'>Accessory</h2>
                                    <div className="flex gap-3 mt-3">
                                        <RadioButton className={'font-normal'} label={'All'} value={accessoryGroup} onChange={handleGroupRadioButton} readOnly={readOnly} />
                                        <RadioButton className={'font-normal'} label={'Item wise'}
                                            value={accessoryGroup ? false : accessoryItemList.length > 0} onChange={handleItemRadioButton} readOnly={readOnly} />
                                        {(accessoryGroup ? false : accessoryItemList.length > 0) ? <button className="font-normal pointer-events-auto bg-lime-500 p-1 rounded transition hover:text-white hover:bg-lime-700" onClick={() => setItemsPopup(true)}>View Items</button> : ""}
                                        {!readOnly ? (accessoryGroup || (accessoryGroup ? false : accessoryItemList.length > 0) ?
                                            <button className="bg-red-600 p-1 text-gray-100 rounded" onClick={() => { setAccessoryGroup(false); setAccessoryItemList([]); }}> Clear </button>
                                            :
                                            "") : ""
                                        }
                                    </div>
                                </div>

                                <button className='bg-blue-400 rounded-md p-0.5 text-xs ml-5 mt-5 w-32' onClick={() => { setIsPartyLogoOpen(true) }} >School Logo</button>


                                <fieldset className='frame my-1 pb-3'>
                                    <legend className='sub-heading'>Process Info</legend>
                                    <MultiSelectDropdown readOnly={readOnly} name="Process" selected={processDetails} setSelected={setProcessDetails}
                                        options={multiSelectOption(processList ? processList.data : [], "name", "id")} />
                                </fieldset>


                                <fieldset className='frame my-1 flex mt-5'>

                                    <legend className='sub-heading'>Official Details</legend>


                                    <div className='flex flex-col justify-start gap-4 mt- flex-1'>
                                        <TextInput name="Party Code" type="text" value={code} setValue={setCode} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="Party Name" type="text" value={name}
                                            setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)}
                                            onBlur={(e) => {
                                                if (aliasName) return
                                                setAliasName(e.target.value)
                                            }
                                            } />
                                        <TextInput name="Alias Name" type="text" value={aliasName} setValue={setAliasName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextArea name="Address" value={address} setValue={setAddress} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <DropdownInput name="City/State Name" options={dropDownListMergedObject(id ? cityList.data : cityList.data.filter(item => item.active), "name", "id")} value={city} setValue={setCity} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="Pan No" type="pan_no" value={panNo} setValue={setPanNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="Pincode" type="text" value={pincode} setValue={setPincode} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                    </div>
                                </fieldset>
                            </div>
                            <div className='mr-1'>
                                <fieldset className='frame my-1'>
                                    <legend className='sub-heading'>Contact Details</legend>
                                    <div className='grid grid-cols-1 gap-2 my-2'>
                                        <TextInput name="Email Id" type="text" value={email} setValue={setEmail} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="Website" type="text" value={website} setValue={setWebsite} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="Contact Person Name" type="text" value={contactPersonName} setValue={setContactPersonName} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="Contact Mobile" type="text" value={contactMobile} setValue={setContactMobile} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="GST No" type="text" value={gstNo} setValue={setGstNo} readOnly={readOnly} />

                                        <TextInput name="Cost Code" type="text" value={costCode} setValue={setCostCode} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    </div>
                                </fieldset>
                                <fieldset className='frame my-1'>
                                    <legend className='sub-heading'>Party Info</legend>
                                    <div className='grid grid-cols-1 gap-2 my-2'>
                                        <TextInput name="Tin No" type="text" value={tinNo} setValue={setTinNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <DateInput name="CST Date" value={cstDate} setValue={setCstDate} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="CST No" type="text" value={cstNo} setValue={setCstNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="Cin No" type="text" value={cinNo} setValue={setCinNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="Fax No" type="text" value={faxNo} setValue={setFaxNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                    </div>

                                </fieldset>


                            </div>

                        </div>

                        {/* <fieldset className='frame my-1'>
                            <legend className='sub-heading'>Shipping Address</legend>
                            <div className='grid grid-cols-1 gap-2 my-2 p-1'>
                                <table className=" border border-gray-500 text-xs table-auto  w-full">
                                    <thead className='bg-blue-200 top-0 border-b border-gray-500'>

                                        <tr className=''>
                                            <th className="tx-table-cell  py-2 w-5">S.No</th>

                                            <th className="tx-table-cell  py-2 ">Address</th>



                                            <th className="tx-table-cell  w-10 p-0.5">  <button onClick={addNewAddress}>{PLUS}</button></th>

                                        </tr>
                                    </thead>
                                    <tbody className='overflow-y-auto h-full w-full'>{console.log(shippingAddress, "shippingAddress")}


                                        {(shippingAddress ? shippingAddress : []).map((item, index) =>
                                            <tr className="w-full tx-table-row">
                                                <td className='tx-table-cell'>
                                                    {index + 1}
                                                </td>


                                                <td className='tx-table-cell'>
                                                    <input
                                                        type="text"
                                                        className="text-left rounded py-2 px-1 w-full tx-table-input"

                                                        value={item?.address ? item?.address : ""}

                                                        disabled={readOnly}
                                                        onChange={(e) =>
                                                            handleInputAddress(e.target.value, index, "address")
                                                        }
                                                    />
                                                </td>
                                                <td className="border border-gray-500 text-xs text-center">
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            deleteAddress(index)
                                                        }}
                                                        className='text-xs text-red-600 '>{DELETE}
                                                    </button>
                                                </td>


                                            </tr>

                                        )}

                                    </tbody>
                                </table>
                            </div>
                        </fieldset> */}


                        {/* <div className='mr-1'>

                            <fieldset className='frame my-1'>
                                <legend className='sub-heading'>Contact Details</legend>
                                <div className='grid grid-cols-1 gap-2 my-2'>
                                    <table className="border border-gray-500">
                                        <thead className="border border-gray-500">
                                            <tr>
                                                <th className="border border-gray-500 text-sm">S.no</th>
                                                <th className="border border-gray-500 text-sm">Contact Person Name</th>
                                                <th className="border border-gray-500 text-sm">Mobile.no</th>

                                                <th className="border border-gray-500 text-sm" >Email Id</th>
                                                <th>
                                                    <button type='button' className="text-green-700" onClick={() => {
                                                        let newContactDetails = [...contactDetails];
                                                        newContactDetails.push({});
                                                        setContactDetails(newContactDetails);
                                                    }}> {<FontAwesomeIcon icon={faUserPlus} />}

                                                    </button>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contactDetails?.map((item, index) =>
                                                <tr className="text-center" key={index}>

                                                    <td className="border border-gray-500 text-xs">
                                                        {index + 1}
                                                    </td>
                                                    <td className="border border-gray-500 text-xs">
                                                        <input className="w-full p-1 capitalize"
                                                            type="text" value={item.contactPersonName} onChange={(e) => {
                                                                const newContactDetails = structuredClone(contactDetails)
                                                                newContactDetails[index]["contactPersonName"] = e.target.value;
                                                                setContactDetails(newContactDetails);
                                                            }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} caseSensitive />

                                                    </td>
                                                    <td className="border border-gray-500 text-xs">
                                                        <input className="w-full p-1" type="text" value={item.mobileNo} onChange={(e) => {
                                                            const newContactDetails = structuredClone(contactDetails);
                                                            newContactDetails[index]["mobileNo"] = e.target.value;
                                                            setContactDetails(newContactDetails);
                                                        }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                                    </td>

                                                    <td className="border border-gray-500 text-xs">
                                                        <input className="w-full p-1" type="text" value={item.email} onChange={(e) => {
                                                            const newContactDetails = structuredClone(contactDetails);
                                                            newContactDetails[index]["email"] = e.target.value;
                                                            setContactDetails(newContactDetails);
                                                        }} readOnly={readOnly} />

                                                    </td>
                                                    <td className="border border-gray-500 p-1 text-xs">
                                                        <button
                                                            type='button'
                                                            onClick={() => removeItem(index)}
                                                            className='text-md text-red-600 ml-1'>{<FontAwesomeIcon icon={faTrashCan} />}</button>
                                                    </td>

                                                </tr>
                                            )}
                                        </tbody>
                                    </table>



                                </div>
                            </fieldset>
                        </div> */}















                        {/* <fieldset className='frame my-1'>
                            <legend className='sub-heading'>Price Info</legend>
                            <div className='grid grid-cols-1 gap-2 my-2 p-1'>
                                <table className=" border border-gray-500 text-xs table-auto  w-full">
                                    <thead className='bg-blue-200 top-0 border-b border-gray-500'>

                                        <tr className=''>
                                            <th className="tx-table-cell  py-2">S.No</th>

                                            <th className="tx-table-cell  py-2">Product Name</th>

                                            <th className="tx-table-cell py-2">Price</th>

                                            <th className="tx-table-cell  w-10 p-0.5">  <button onClick={addNewRow}>{PLUS}</button></th>

                                        </tr>
                                    </thead>
                                    <tbody className='overflow-y-auto h-full w-full'>


                                        {(priceDetails ? priceDetails : []).map((item, index) =>
                                            <tr className="w-full tx-table-row">
                                                <td className='tx-table-cell'>
                                                    {index + 1}
                                                </td>
                                                <td className='tx-table-cell'>
                                                    <DropdownWithSearch value={item?.productId}
                                                        readOnly={readOnly}

                                                        setValue={(value) => handleInputChange(value, index, "productId")}
                                                        options={productList?.data?.filter(item => item?.active)} />
                                                </td>

                                                <td className='tx-table-cell w-24'>
                                                    <input
                                                        type="number"
                                                        className="text-right rounded py-2 px-1 w-full tx-table-input"

                                                        value={item?.price ? item?.price : 0}

                                                        disabled={readOnly}
                                                        onChange={(e) =>
                                                            handleInputChange(e.target.value, index, "price")
                                                        }
                                                    />
                                                </td>
                                                <td className="border border-gray-500 text-xs text-center">
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            deleteRow(index)
                                                        }}
                                                        className='text-xs text-red-600 '>{DELETE}
                                                    </button>
                                                </td>


                                            </tr>

                                        )}

                                    </tbody>
                                </table>
                            </div>
                        </fieldset> */}


                    </div>
                    <div className="frame hidden md:block overflow-x-hidden">
                        <FormReport
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                            setId={setId}
                            tableHeaders={tableHeaders}
                            tableDataNames={tableDataNames}
                            data={allData?.data}
                            loading={
                                isLoading || isFetching
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Party;
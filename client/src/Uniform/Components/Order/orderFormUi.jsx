import { HiPlus, HiShare, HiPrinter, HiTrash, HiMinus, HiLocationMarker, HiCheck } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { HiX, HiOutlineRefresh } from "react-icons/hi";
import {
    ReusableSearchableInput,
    ReusableDropdown,
    ReusableInput,
} from "./CommonInput";

import { FiSave, FiPlusCircle, FiMail, FiPrinter, FiX, FiCopy, FiShare2 } from "react-icons/fi";
import AddressForm from "../../../Shocks/CommonReport/AddressForm";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    useGetOrderQuery,
    useGetOrderByIdQuery,
    useAddOrderMutation,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
} from "../../../redux/uniformService/OrderService";
import { useDeletePartyMutation, useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";

import { toast } from "react-toastify";

import moment from "moment";
import { getCommonParams, renameFile } from "../../../Utils/helper";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";

import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";
import { useGetSocksTypeQuery } from "../../../redux/uniformService/SocksTypeMasterService";
import { useGetYarnNeedleMasterQuery } from "../../../redux/uniformService/YarnNeedleMasterservices";
import { useGetFiberContentMasterQuery } from "../../../redux/uniformService/FiberContentMasterServices";
import { getImageUrlPath } from "../../../helper";
import { useGetMachineQuery } from "../../../redux/services/MachineMasterService";
import OrderItems from "./OrderItems";
import { packingCover } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";

const OrderFormUi = ({ orderDetails, setOrderDetails, readOnly, setReadOnly, setId, id, onClose, partyData }) => {
    const [suppliers, setSuppliers] = useState([
        "Supplier One",
        "Supplier Two",
        "Supplier Three",
    ]);
    const [showExtraCharge, setShowExtraCharge] = useState(false)
    const [showDiscount, setShowDiscount] = useState(false)
    const [isEditing, setIsEditing] = useState(false);
    const [term, setTerm] = useState("");

    const handleAdd = () => {
        if (term.trim()) {
            console.log("Term added:", term);
            setTerm("");
            setIsEditing(false);
        }
    };
    const [addressForm, setAddressForm] = useState(false)
    const [showAddressPopup, setShowAddressPopup] = useState(false)
    const handleAddSupplier = (newName) => {
        if (!suppliers.includes(newName)) {
            setSuppliers([...suppliers, newName]);
        }
    };





    const [docId, setDocId] = useState("")


    const [active, setActive] = useState(true);

    const [validDate, setValidDate] = useState()

    const [tempOrderDetails, setTempOrderDetails] = useState([]);
    const [phone, setPhone] = useState()
    const [address, setAddress] = useState()
    const [contactPersonName, setContactPersonName] = useState("");

    const [partyId, setPartyId] = useState("");
    const [date, setDate] = useState("");
    const childRecord = useRef(0);
    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const [printModalOpen, setPrintModalOpen] = useState(false)
    const [packingCoverType, setPackingCoverType] = useState("")
    const [loading, setLoading] = useState(false);



    const [isLogo, setIsLogo] = useState(false)
    const params = {
        branchId, userId, finYearId
    };
    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });

    const { data: socksMaterialData } =
        useGetSocksMaterialQuery({ params: { ...params } });


    const { data: socksTypeData } =
        useGetSocksTypeQuery({ params: { ...params } });

    const { data: allData, isLoading, isFetching } = useGetOrderQuery({ params, searchParams: '' });
    const { data: sizeList, isLoading: isSizeListLoading } = useGetSizeMasterQuery({ params: { ...params } });
    const { data: styleList, isLoading: isStyleListLoading } = useGetStyleMasterQuery({ params: { ...params } });
    const { data: Yarnlist } = useGetYarnNeedleMasterQuery({ params: { ...params } });
    const { data: machineList } = useGetMachineQuery({ params: { ...params } });
    const { data: fiberContent } = useGetFiberContentMasterQuery({ params: { ...params } });

    const {
        data: colorlist,
        isLoading: isColorListLoading,
        isFetching: isColorListFetching,
    } = useGetColorMasterQuery({ params });


    const getNextDocId = useCallback(() => {
        if (id || isLoading || isFetching) return
        if (allData?.nextDocId) {
            setDocId(allData.nextDocId)
        }
    }, [allData, isLoading, isFetching, id])

    useEffect(getNextDocId, [getNextDocId])

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetOrderByIdQuery(id, { skip: !id });
    const [addData] = useAddOrderMutation();
    const [updateData] = useUpdateOrderMutation();
    const [removeData] = useDeletePartyMutation();


    const { data: singleSupplier, isLoading: isSingleSupplierLoading, isFetching: isSingleSupplierFetching } =
        useGetPartyByIdQuery(partyId, { skip: !partyId });


    console.log(singleData, "singggg")

    const syncFormWithDb = useCallback((data) => {
        if (id) {
            setReadOnly(readOnly ? readOnly : false);
        }

        if (data?.docId) {
            setDocId(data?.docId)
        }

        setDate(data?.createdAt ? moment(data?.createdAt).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD"));
        setPartyId(data?.partyId ? data?.partyId : "");
        setContactPersonName(data?.contactPersonName ? data?.contactPersonName : "")
        setPhone(data?.phone ? data?.phone : "");
        setAddress(data?.address ? data?.address : "");
        setValidDate(data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : "");
        setOrderDetails(data?.orderDetails ? data?.orderDetails : []);
        setPackingCoverType(data?.packingCoverType ? data?.packingCoverType : "");

    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        branchId, id, userId, companyId,
        packingCoverType,
        active,
        partyId, finYearId, phone, contactPersonName, address, validDate, orderDetails: orderDetails?.filter(j => j.styleId && j.socksMaterialId && j.socksTypeId && j.qty)
    }

    const validateData = (data) => {

        if (orderDetails?.length > 0 && data.partyId) {
            return true
        }

        return false
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            const formData = new FormData();
            for (let key in data) {
                if (key === 'orderDetails') {
                    formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? i.filePath.name : i.filePath }))));
                    data[key].forEach(option => {
                        if (option?.filePath instanceof File) {
                            formData.append('images', option.filePath);
                        }
                    });
                } else {
                    formData.append(key, data[key]);
                }
            }

            let returnData;
            if (text === "Updated") {
                console.log(formData, "formData")
                returnData = await callback({ id, body: formData }).unwrap();
            } else {
                returnData = await callback(formData).unwrap();
            }
            if (returnData.statusCode === 0) {
                setId(returnData?.data?.id);
                syncFormWithDb(undefined);
                toast.success(text + "Successfully");
            } else {
                toast.error(returnData?.message);
            }

        } catch (error) {
            console.log("handle", error);
        }
    };

    const saveData = () => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" })
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            console.log(id, "ididi")
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    }


    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };

    const onNew = () => {
        setId("");
        setReadOnly(false);
        setOrderDetails([]);

    }

    useEffect(() => {
        if (orderDetails?.length >= 1) return
        setOrderDetails(prev => {
            let newArray = Array.from({ length: 1 - prev.length }, () => {
                return {
                    yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
                    measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
                    stripecolorId: "", noOfStripes: "0", qty: "0", socksTypeId: "",
                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setOrderDetails, orderDetails])


    useEffect(() => {
        if (id) return
        if (!singleSupplier?.data || isSingleSupplierLoading || isSingleSupplierFetching) return
        if (!partyId) return
        setPhone(singleSupplier?.data?.contactMobile ? singleSupplier?.data.contactMobile : "")
        setContactPersonName(singleSupplier?.data?.contactPersonName ? singleSupplier?.data.contactPersonName : "");
        setAddress(singleSupplier?.data?.address ? singleSupplier?.data.address : "");
    }, [setPhone, setContactPersonName, partyId, singleSupplier, isSingleSupplierLoading, isSingleSupplierFetching])


    let itemHeading = [
        "S.No.",
        "Style",
        "Image",
        "Needle",
        "Machine",
        "Fab.Content",
        "Desc",
        "Material",
        "Socks.Type",
        "Leg.col",
        "Foot.col",
        "Stripe.col",
        "N.Stripe",
        "Size",
        "S.Mea",
        "Qty",
        "Wt.socks",
        "Edit/Del"
    ]


    async function onDeleteItem(itemId) {
        await removeData(itemId).unwrap();
    }

    return (
        <>
            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Order</h1>
                    <button
                        onClick={onClose}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Open Report"
                    >
                        <FaFileAlt className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 h-full ">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Document Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Order.No" readOnly value={docId} />

                                <ReusableInput label="Order Date" value={date} type={"date"} required={true} readOnly={true} disabled />
                                <ReusableInput label="Due Date" type="date" value={validDate} setValue={setValidDate} readOnly={readOnly} />
                            </div>
                        </div>



                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2">Party Details</h2>

                            <div className="grid grid-cols-1">
                                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                                    <div className="col-span-2">
                                        <ReusableSearchableInput
                                            label="Party" ReusableSearchableInput
                                            component="PartyMaster"
                                            placeholder="Search Parties..."
                                            optionList={supplierList?.data}
                                            onAddItem={handleAddSupplier}
                                            onDeleteItem={onDeleteItem}
                                            setSearchTerm={setPartyId}
                                            searchTerm={partyId}
                                        />
                                    </div>


                                    <ReusableDropdown
                                        label="Packing.Cover"
                                        options={packingCover}
                                        value={packingCoverType}
                                        setValue={setPackingCoverType}

                                    />





                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Source Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full pl-2.5 pr-8 py-1 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                                placeholder="Select address"
                                                readOnly
                                                value={address}

                                                onClick={() => setShowAddressPopup(true)}
                                            />
                                            <div
                                                className="absolute inset-y-0 right-0 flex items-center pr-2.5 cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors"
                                                onClick={() => setShowAddressPopup(true)}
                                            >
                                                <HiLocationMarker className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {showAddressPopup && (
                                            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
                                                <div className="bg-[f1f1f0] rounded-lg shadow-xl w-full max-w-md">
                                                    <div className="flex justify-between items-center border-b border-slate-200 p-4">
                                                        <h3 className="text-lg font-medium text-slate-800">Select Address</h3>
                                                        <button
                                                            onClick={() => setShowAddressPopup(false)}
                                                            className="text-white bg-red-600 rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <HiX className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    <div className="p-4  bg-white max-h-[60vh] overflow-y-auto">
                                                        <div className="space-y-3">
                                                            {/* <div
                                                                className="p-3 border border-slate-200 rounded-md hover:border-indigo-300 cursor-pointer transition-colors"
                                                                onClick={() => {
                                                                    setShowAddressPopup(false);
                                                                }}
                                                            >
                                                                <h4 className="font-medium text-slate-800">Main Office</h4>
                                                                <p className="text-sm text-slate-600 mt-1">123 Business St, Suite 100, San Francisco, CA 94107</p>
                                                            </div>

                                                            <div
                                                                className="p-3 border border-slate-200 rounded-md hover:border-indigo-300 cursor-pointer transition-colors"
                                                                onClick={() => {
                                                                    setShowAddressPopup(false);
                                                                }}
                                                            >
                                                                <h4 className="font-medium text-slate-800">Warehouse</h4>
                                                                <p className="text-sm text-slate-600 mt-1">456 Industrial Ave, Oakland, CA 94601</p>
                                                            </div> */}
                                                            {partyData?.find(j => parseInt(j.id) == parseInt(partyId))?.ShippingAddress?.map((item, index) => (

                                                                <div key={index}
                                                                    className="p-3 border border-slate-200 rounded-md hover:border-indigo-300 cursor-pointer transition-colors"
                                                                    onClick={() => {
                                                                        setAddress(item?.address);
                                                                        setShowAddressPopup(false)

                                                                    }}
                                                                >
                                                                    <h4 className="font-medium text-slate-800">{item?.aliasName}</h4>
                                                                    <p className="text-sm text-slate-600 mt-1">{item?.address}</p>
                                                                </div>
                                                            ))}
                                                        </div>{console.log(address, "adresss")}

                                                        <button onClick={() => setAddressForm(true)} className="mt-4 w-full flex items-center justify-center py-2 px-3 border border-dashed border-slate-300 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors">
                                                            <HiPlus className="w-4 h-4 mr-2" />
                                                            <span>Add New Address</span>
                                                        </button>
                                                    </div>

                                                    <div className="border-t border-slate-200 p-4 flex justify-end">
                                                        <button
                                                            onClick={() => setShowAddressPopup(false)}
                                                            className="px-4 py-1 bg-white hover:bg-red-600 text-red-600  hover:text-white border border-red-600 
             text-red-700 rounded-md hover:bg-red-700 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {addressForm && <AddressForm setAddressForm={setAddressForm} />}

                                    </div>
                                </div>
                            </div>
                        </div>



                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Contact Details
                            </h2>
                            <div className="grid grid-cols-1 gap-y-2 gap-x-3">
                                <ReusableInput
                                    label="Contact Person"
                                    placeholder="Contact name"
                                />
                                <ReusableInput
                                    label="Phone"
                                    placeholder="Contact name"
                                />
                                {/* <ReusableInput
                                    label=""
                                    placeholder="Contact name"
                                /> */}
                            </div>
                        </div>
                    </div>

                    <OrderItems readOnly={readOnly} itemHeading={itemHeading} setOrderDetails={setOrderDetails} orderDetails={orderDetails} />
                    <div className="grid grid-cols-3 gap-3">
                        <div className="border border-slate-200 p-3 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2 text-base">
                                Terms & Conditions
                            </h2>

                            <div className="flex items-center bg-white border border-gray-300 focus-within:border-indigo-500 rounded-md px-2 py-1 shadow-sm transition-colors">
                                <input
                                    type="text"
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    className="text-sm px-2 outline-none w-full"
                                    placeholder="Enter term..."
                                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                />
                                <button
                                    onClick={handleAdd}
                                    className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
                                    title="Confirm"
                                >
                                    <HiCheck className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-3 space-y-1.5">
                                <div className="flex justify-between items-center p-1.5 bg-slate-50 rounded text-[12px]">
                                    <span>Payment due within 30 days</span>
                                    <button className="text-red-400 hover:text-red-500">
                                        <HiTrash className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center p-1.5 bg-slate-50 rounded text-[12px]">
                                    <span>Late fee of 2% per month</span>
                                    <button className="text-red-400 hover:text-red-500">
                                        <HiTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border border-slate-200 p-3 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2 text-base">Notes</h2>
                            <textarea
                                className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-md h-24 focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                placeholder="Additional notes..."
                            />
                        </div>

                        {/* Pricing Summary (Grand Total) Section */}
                        <div className="border border-slate-200 p-3 bg-white rounded-md shadow-sm">
                            <h2 className="font-semibold text-slate-800 mb-2 text-base">
                                Pricing Summary
                            </h2>

                            <div className="space-y-1.5">
                                <div className="flex justify-between py-1 text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-medium">$1,250.00</span>
                                </div>

                                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                                    <span className="text-slate-800 font-semibold">Grand Total</span>
                                    <span className="font-bold text-indigo-700">$1,200.00</span>
                                </div>
                                <div className="flex gap-5 items-center mb-1 text-xs">
                                    <button
                                        className="text-green-600 text-[14px] hover:text-white hover:bg-green-600 border border-green-700 px-2 py-1 rounded-md  flex items-center"
                                        onClick={() => setShowDiscount(true)}
                                    >
                                        <HiMinus className="w-2.5 h-2.5 mr-1" />
                                        <span>Add Discount</span>
                                    </button>
                                    <button
                                        className="text-indigo-600 text-[14px] hover:text-white hover:bg-indigo-600 border border-indigo-700 px-2 py-1 rounded-md flex items-center"
                                        onClick={() => setShowExtraCharge(true)}
                                    >
                                        <HiPlus className=" w-2.5 h-2.5 mr-1" />
                                        <span> Extra Charge</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showExtraCharge && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-base font-semibold">Add Extra Charge</h3>
                                        <button onClick={() => setShowExtraCharge(false)} className="text-slate-400 hover:text-slate-600">
                                            <HiX className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                                            <input
                                                type="text"
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                placeholder="e.g. Delivery fee"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
                                            <input
                                                type="number"
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <button className="w-full bg-indigo-600 text-white py-1.5 px-3 rounded text-sm hover:bg-indigo-700 transition">
                                            Apply Charge
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showDiscount && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-base font-semibold">Add Discount</h3>
                                        <button onClick={() => setShowDiscount(false)} className="text-slate-400 hover:text-slate-600">
                                            <HiX className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                                            <input
                                                type="text"
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                placeholder="e.g. Summer promotion"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                                                <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                                    <option>Percentage</option>
                                                    <option>Fixed Amount</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Value</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <button className="w-full bg-green-600 text-white py-1.5 px-3 rounded text-sm hover:bg-green-700 transition">
                                            Apply Discount
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                        {/* Left Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            <button className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm">
                                <FiSave className="w-4 h-4 mr-2" />
                                Save
                            </button>
                            <button className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                Save & Next
                            </button>
                        </div>

                        {/* Right Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                <FiShare2 className="w-4 h-4 mr-2" />
                                Email
                            </button>
                            <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                <FaWhatsapp className="w-4 h-4 mr-2" />
                                WhatsApp
                            </button>
                            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
                                <FiPrinter className="w-4 h-4 mr-2" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>

    );
};

export default OrderFormUi;

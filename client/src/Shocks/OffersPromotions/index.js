import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useGetoffersPromotionsQuery, useGetoffersPromotionsByIdQuery, useAddoffersPromotionsMutation, useUpdateoffersPromotionsMutation, useDeleteoffersPromotionsMutation } from '../../redux/uniformService/Offer&PromotionsService';
import { useGetSizeMasterQuery } from "../../redux/uniformService/SizeMasterService";
import { useGetItemMasterQuery } from "../../redux/uniformService/ItemMasterService";
import { useGetItemCategoryQuery } from "../../redux/uniformService/ItemCategoryMasterService";
import { useGetcollectionsQuery } from "../../redux/uniformService/CollectionsService";
import secureLocalStorage from "react-secure-storage";
import Swal from 'sweetalert2';
import { Check, X, Trash2, Globe, Package, FolderTree, Power, Settings, Eye, Info, Sparkles } from "lucide-react";
import {
    TextInputNew1,
    DropdownInputNew,
    MultiSelectDropdownNew,
    ToggleButton,
    ReusableTable,
} from "../../Inputs";
import Modal from "../../UiComponents/Modal";
import MasterPageLayout from "../../Basic/components/MasterPageLayout";
import { useFormKeyboardNavigation } from '../../CustomHooks/useFormKeyboardNavigation';

// --- Constants ---
const OFFER_TYPES = [
    { show: 'Percentage Discount', value: 'Percentage' },
    { show: 'Fixed Amount Off', value: 'Fixed' },
    { show: 'Volume Tiered', value: 'Volume' },
    { show: 'Price Override', value: 'Override' }
];

const SCOPE_OPTIONS = [
    { id: 'Global', label: 'Global', icon: Globe },
    { id: 'Collection', label: 'Collection', icon: FolderTree },
    { id: 'Item', label: 'Items', icon: Package },
];

const CONDITION_FIELDS = [
    { show: 'Min Total Qty', value: 'Minimum Quantity' },
    { show: 'Cart Value', value: 'Cart Value' },
    // { show: 'Size Qty', value: 'Specific Size Quantity' },
    // { show: 'Equal Ratio', value: 'Equal Ratio' }
];

const OPERATORS = [
    { show: 'Greater than or Equal to', value: '>=' },
    { show: 'Less than or Equal to', value: '<=' },
    { show: 'Equal to', value: '==' }
];

const STACKING_RULES = [
    { value: 'Best Of', label: 'Best Of' },
    { value: 'Exclusive', label: 'Exclusive' },
    { value: 'Stackable', label: 'Stackable' }
];

// Initial values moved to states


const OffersPromotions = () => {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [benefitType, setBenefitType] = useState("Percentage");
    const [status, setStatus] = useState("Active");
    const [priority, setPriority] = useState(1);
    const [scope, setScope] = useState("Global");
    const [scopeSelection, setScopeSelection] = useState([]);
    const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
    const [validTo, setValidTo] = useState("");
    const [noEndDate, setNoEndDate] = useState(true);
    const [conditions, setConditions] = useState([{ field: "Minimum Quantity", operator: ">=", value: 1 }]);
    const [benefitPercentage, setBenefitPercentage] = useState(0);
    const [benefitAmount, setBenefitAmount] = useState(0);
    const [benefitMaxDiscount, setBenefitMaxDiscount] = useState(0);
    const [benefitApplyOn, setBenefitApplyOn] = useState('Each line');
    const [benefitTiers, setBenefitTiers] = useState([]);
    const [stacking, setStacking] = useState("Best Of");
    const [conditionLogic, setConditionLogic] = useState("AND");

    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [selectionSearch, setSelectionSearch] = useState("");
    const [previewItem, setPreviewItem] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const { refs, handlers } = useFormKeyboardNavigation();
    const { firstInputRef: nameRef, saveCloseButtonRef } = refs;

    const params = {
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        branchId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "branchId") || 1,
    };

    // --- Queries & Mutations ---
    const { data: sizes } = useGetSizeMasterQuery(params);
    const sizeOptions = useMemo(() => (sizes?.data || []).map(s => ({ label: s.name, value: s.id })), [sizes]);

    const { data: items } = useGetItemMasterQuery({ params });
    const itemOptions = useMemo(() => (items?.data || []).map(i => ({ label: i.name, value: i.id })), [items]);

    const { data: categories } = useGetItemCategoryQuery({ params });
    const categoryOptions = useMemo(() => (categories?.data || []).map(c => ({ label: c.name, value: c.id })), [categories]);

    const { data: collections } = useGetcollectionsQuery({ params });
    const collectionOptions = useMemo(() => (collections?.data || []).map(c => ({ label: c.name, value: c.id })), [collections]);

    const { data: allData, isLoading, isFetching } = useGetoffersPromotionsQuery({ params, searchParams: searchValue });
    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetoffersPromotionsByIdQuery(id, { skip: !id });

    const [addData] = useAddoffersPromotionsMutation();
    const [updateData] = useUpdateoffersPromotionsMutation();
    const [removeData] = useDeleteoffersPromotionsMutation();

    // --- Helpers ---
    const updateCondition = (idx, key, val) => {
        const newConds = [...conditions];
        newConds[idx] = { ...newConds[idx], [key]: val };
        setConditions(newConds);
    };

    const updateTier = (idx, key, val) => {
        const newTiers = [...benefitTiers];
        newTiers[idx] = { ...newTiers[idx], [key]: val };
        setBenefitTiers(newTiers);
    };

    const syncFormWithDb = useCallback((data) => {
        if (data) {
            setName(data.name || "");
            setCode(data.code || "");
            setDescription(data.description || "");
            setBenefitType(data.discountType || "Percentage");
            setStatus(data.active ? 'Active' : 'Inactive');
            setPriority(data.priority || 1);
            setScope(data.scopeMode || "Global");
            setValidFrom(data.validFrom || new Date().toISOString().split('T')[0]);
            setValidTo(data.validTo || "");
            setNoEndDate(!data.validTo);
            setStacking(data.stacking || "Best Of");
            setConditionLogic(data.OfferRule?.[0]?.logic || "AND");

            setScopeSelection(data.OfferScope ? data.OfferScope.map(s => {
                const option = data.scopeMode === 'Item' ? itemOptions.find(i => i.value === s.refId) : collectionOptions.find(c => c.value === s.refId);
                return option || { label: `ID: ${s.refId}`, value: s.refId };
            }) : []);

            setConditions((data.OfferRule?.[0]?.conditions?.rules || [{ field: "Minimum Quantity", operator: ">=", value: 1 }]).map(c => {
                if ((c.field === 'Specific Size Quantity' || c.field === 'Equal Ratio') && c.sizeId && !c.sizes) {
                    const opt = sizeOptions.find(o => String(o.value) === String(c.sizeId));
                    return { ...c, sizes: opt ? [opt] : [] };
                }
                return c;
            }));

            setBenefitPercentage(data.discountType === 'Percentage' ? data.discountValue : 0);
            setBenefitAmount(data.discountType === 'Fixed' ? data.discountValue : 0);
            setBenefitMaxDiscount(data.maxDiscountValue || 0);
            setBenefitApplyOn(data.applyOn || "Each line");
            setBenefitTiers(data.OfferTier?.length > 0 ? data.OfferTier : (data.tiers ? (typeof data.tiers === 'string' ? JSON.parse(data.tiers) : data.tiers) : []));
        } else {
            setName("");
            setCode("");
            setDescription("");
            setBenefitType("Percentage");
            setStatus("Active");
            setPriority(1);
            setScope("Global");
            setScopeSelection([]);
            setValidFrom(new Date().toISOString().split('T')[0]);
            setValidTo("");
            setNoEndDate(true);
            setConditions([{ field: "Minimum Quantity", operator: ">=", value: 1 }]);
            setBenefitPercentage(0);
            setBenefitAmount(0);
            setBenefitMaxDiscount(0);
            setBenefitApplyOn('Each line');
            setBenefitTiers([]);
            setStacking("Best Of");
            setConditionLogic("AND");
        }
    }, [id, itemOptions, collectionOptions, sizeOptions]);

    useEffect(() => {
        if (singleData?.data) {
            syncFormWithDb(singleData.data);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const dataForSubmit = {
        ...params,
        name,
        code,
        description,
        priority,
        scope,
        validFrom,
        validTo,
        stacking,
        conditionLogic,
        conditions,
        discountType: benefitType,
        discountValue: benefitType === 'Percentage' ? benefitPercentage : benefitAmount,
        maxDiscountValue: benefitMaxDiscount,
        applyOn: benefitApplyOn,
        active: status === 'Active',
        id,
        tiers: JSON.stringify(benefitTiers || []),
        selectionIds: JSON.stringify(scopeSelection || [])
    };

    const validateData = (data) => {
        if (data.name && data.code && data.validFrom) {
            return true;
        }
        return false;
    };

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id);
            await Swal.fire({
                title: text + " Successfully",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            if (nextProcess === "new") {
                onNew();
            } else {
                setForm(false);
                setId("");
                syncFormWithDb(undefined);
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Submission error',
                text: error.data?.message || 'Something went wrong!',
            });
        }
    };

    const saveData = async (nextProcess) => {
        const finalData = { ...dataForSubmit };

        if (!validateData(finalData)) {
            Swal.fire({
                title: 'Please fill all required fields...!',
                icon: 'error',
                didClose: () => {
                    nameRef?.current?.focus();
                }
            });
            return;
        }

        if (id) {
            if (!window.confirm("Are you sure you want to update the details?")) {
                return;
            }
            handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, finalData, "Added", nextProcess);
        }
    };

    // const handleDelete = async (id) => {
    //     const result = await Swal.fire({ title: 'Delete?', text: "Permanent Action", icon: 'warning', showCancelButton: true, confirmButtonColor: '#0f172a' });
    //     if (result.isConfirmed) {
    //         try { await removeData(id).unwrap(); Swal.fire('Deleted!', '', 'success'); }
    //         catch (err) { Swal.fire('Error', 'Deletion failed.', 'error'); }
    //     }
    // };
    const handleDelete = async (id) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Submission error',
                        text: deldata.data?.message || 'Something went wrong!',
                    });
                    return;
                }
                setId("");
                await Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",
                });
                setForm(false);
                syncFormWithDb(undefined);
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Submission error',
                    text: error.data?.message || 'Something went wrong!',
                });
                setForm(false);
            }
        }
    };


    const onNew = () => {
        setId("");
        setReadOnly(false);
        setForm(true);
        syncFormWithDb(undefined);
    };

    const handleView = (id) => {
        setId(id);
        setReadOnly(true);
        setForm(true);
    };

    const handleEdit = (id) => {
        setId(id);
        setReadOnly(false);
        setForm(true);
    };

    const handlePreview = (item) => {
        setPreviewItem(item);
        setShowPreview(true);
    };

    const isFormValid = name && code && validFrom;

    // --- Row components ---
    const ACTIVE = (<div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white"><Power size={10} /></div>);
    const INACTIVE = (<div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white"><Power size={10} /></div>);

    const columns = [
        { header: "S.No", accessor: (item, index) => index + 1, className: "w-12 text-center" },
        { header: "Offer Name", accessor: (item) => item.name, className: "w-64 text-left" },
        { header: "Type", accessor: (item) => item.discountType, className: "w-24 text-left" },
        { header: "Value", accessor: (item) => (['Volume', 'Override'].includes(item.discountType) ? "Tiered" : (item.discountType === 'Percentage' ? `${item.discountValue}%` : `₹${item.discountValue}`)), className: "w-24 text-right" },
        { header: "Status", accessor: (item) => (item.active ? ACTIVE : INACTIVE), className: "w-16 text-center" },
        {
            header: "Preview",
            accessor: (item) => (
                <button
                    onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1 mx-auto group"
                >
                    <Eye size={12} className="group-hover:scale-110" />
                </button>
            ),
            className: "w-16 text-center"
        }
    ];

    // console.log(formState, "formState")

    const formBody = (
        <div className="flex-1 flex flex-col overflow-hidden p-2 bg-gray-100/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 min-h-0">

                {/* COL 1: BASIC DETAILS & TIMELINE (3 Units) */}
                <div className="lg:col-span-3 space-y-2 flex flex-col h-full overflow-y-auto pr-1">
                    <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-1.5 text-[10px] uppercase tracking-wider opacity-60">Basic Details</h3>
                        <div className="space-y-2">
                            <TextInputNew1 ref={nameRef} name="Offer Name" value={name} setValue={setName} readOnly={readOnly} required />
                            <TextInputNew1 name="Code" value={code} setValue={setCode} readOnly={readOnly} required />
                            <DropdownInputNew name="Offer Type" options={OFFER_TYPES} value={benefitType} setValue={setBenefitType} readOnly={readOnly} />
                            <TextInputNew1 name="Priority" type="number" value={priority} setValue={setPriority} readOnly={readOnly} />
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-1.5 text-[10px] uppercase tracking-wider opacity-60">Timeline</h3>
                        <div className="space-y-2 mb-1.5">
                            <TextInputNew1 name="Starts From" type="date" value={validFrom} setValue={setValidFrom} readOnly={readOnly} required />
                            <div className="space-y-1">
                                <TextInputNew1 name="Ends At" type="date" value={validTo} setValue={setValidTo} readOnly={readOnly || noEndDate} disabled={noEndDate} />
                                <label className="flex items-center gap-2 cursor-pointer mt-1 pl-1">
                                    <input type="checkbox" checked={noEndDate} onChange={(e) => setNoEndDate(e.target.checked)} disabled={readOnly} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Running Forever</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm mt-auto">
                        <h3 className="font-bold text-gray-800 mb-1.5 text-[10px] uppercase tracking-wider opacity-60">Status</h3>
                        <ToggleButton name="Is Active" value={status === 'Active'} setActive={(v) => setStatus(v ? 'Active' : 'Inactive')} readOnly={readOnly} />
                    </div>
                </div>

                {/* COL 2: SCOPE & RULES (6 Units) - Table Structure */}
                <div className="lg:col-span-6 flex flex-col h-full space-y-2">
                    <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm flex flex-col">
                        <h3 className="font-bold text-gray-800 mb-2 text-[10px] uppercase tracking-wider opacity-60">Targeting Strategy</h3>
                        <table className="w-full text-[10px] border-collapse">
                            <tbody>
                                <tr className="border-b border-gray-50">
                                    <td className="py-2 px-1 font-bold text-gray-400 uppercase w-20 text-[9px]">Scope Mode</td>
                                    <td className="py-2 px-1">
                                        <div className="grid grid-cols-3 gap-2">
                                            {SCOPE_OPTIONS.map(opt => (
                                                <div key={opt.id} onClick={() => { if (!readOnly && scope !== opt.id) { setScope(opt.id); setScopeSelection([]); } }} className={`p-1 rounded border-2 text-center cursor-pointer transition-all ${scope === opt.id ? 'border-indigo-600 bg-indigo-50 shadow-sm text-indigo-700' : 'border-gray-50 bg-gray-50 hover:bg-white'}`}>
                                                    <div className="flex justify-center mb-0.5"><opt.icon size={11} /></div>
                                                    <div className="text-[9px] font-bold uppercase">{opt.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                                {scope !== 'Global' && (
                                    <tr>
                                        <td className="py-3 px-1 font-bold text-gray-400 uppercase align-top text-[9px]">Scope Target</td>
                                        <td className="py-2 px-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowSelectionModal(true)}
                                                className="w-full py-2 px-3 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 font-bold text-[10px] uppercase hover:bg-indigo-100 transition-all flex justify-between items-center"
                                            >
                                                <span>{scopeSelection?.length || 0} {scope}s Included</span>
                                                <Settings size={12} className="opacity-50" />
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden min-h-0 max-h-[35vh] lg:max-h-none">
                        <div className="p-2 border-b bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider opacity-60">Eligibility Rules</h3>
                                <div className="flex bg-gray-200 p-0.5 rounded-md">
                                    {['AND', 'OR'].map(logic => (
                                        <button
                                            key={logic}
                                            onClick={() => !readOnly && setConditionLogic(logic)}
                                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${conditionLogic === logic ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {logic === 'AND' ? 'Match All' : 'Match Any'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {!readOnly && (
                                <button
                                    onClick={() => setConditions([...conditions, { field: "Minimum Quantity", operator: ">=", value: 1 }])}
                                    className="text-[11px] font-bold text-blue-600 hover:underline uppercase"
                                >
                                    + Add Rule
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-[11px] text-left table-fixed">
                                <thead className="bg-gray-100/80 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-2 border-b font-bold text-gray-500 uppercase tracking-tighter text-[10px] w-12 text-center">S.No</th>
                                        <th className="p-2 border-b font-bold text-gray-500 uppercase tracking-tighter text-[10px] w-48">Condition</th>
                                        <th className="p-2 border-b font-bold text-gray-500 uppercase tracking-tighter text-[10px] w-60 text-center">Operation</th>
                                        <th className="p-2 border-b font-bold text-gray-500 uppercase tracking-tighter text-[10px] w-24 text-center">Value</th>
                                        {!readOnly && <th className="p-2 border-b font-bold text-gray-500 uppercase tracking-tighter text-[10px] w-10 text-center"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {conditions.map((cond, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors group">
                                            <td className="p-2 text-center text-gray-400 font-bold">{idx + 1}</td>
                                            <td className="p-1">
                                                <div className="w-full overflow-hidden">
                                                    <DropdownInputNew labelHidden={true} options={CONDITION_FIELDS} value={cond.field} setValue={(v) => updateCondition(idx, 'field', v)} readOnly={readOnly} />
                                                </div>
                                            </td>
                                            <td className="p-1 text-center">
                                                <div className="w-full px-1">
                                                    <DropdownInputNew labelHidden={true} options={OPERATORS} value={cond.operator} setValue={(v) => updateCondition(idx, 'operator', v)} readOnly={readOnly} />
                                                </div>
                                            </td>
                                            <td className="p-1 text-center">
                                                <div className="w-full px-1">
                                                    {cond.field === 'Specific Size Quantity' || cond.field === 'Equal Ratio' ? (
                                                        <div className="flex gap-2 items-center">
                                                            <div className="flex-1 min-w-[120px]">
                                                                <MultiSelectDropdownNew
                                                                    labelHidden={true}
                                                                    options={sizeOptions}
                                                                    selected={cond.sizes || []}
                                                                    setSelected={(v) => updateCondition(idx, 'sizes', v)}
                                                                    readOnly={readOnly}
                                                                />
                                                            </div>
                                                            <div className="w-20">
                                                                <TextInputNew1 labelHidden={true} type="number" value={cond.value} setValue={(v) => updateCondition(idx, 'value', v)} readOnly={readOnly} placeholder="Qty" />
                                                            </div>
                                                        </div>
                                                    ) : cond.field === 'Cart Value' ? (
                                                        <div className="relative">
                                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px] z-10">₹</div>
                                                            <TextInputNew1 labelHidden={true} type="number" value={cond.value} setValue={(v) => updateCondition(idx, 'value', v)} readOnly={readOnly} />
                                                        </div>
                                                    ) : (
                                                        <TextInputNew1 labelHidden={true} type="number" value={cond.value} setValue={(v) => updateCondition(idx, 'value', v)} readOnly={readOnly} className={"text-right"} />
                                                    )}
                                                </div>
                                            </td>
                                            {!readOnly && (
                                                <td className="p-1 text-center">
                                                    <button
                                                        onClick={() => setConditions(conditions.filter((_, i) => i !== idx))}
                                                        className="text-red-300 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {conditions.length === 0 && (
                                        <tr>
                                            <td colSpan={readOnly ? 3 : 4} className="p-8 text-center text-gray-400 italic font-medium tracking-tight">
                                                No conditions set. Offer applies to all eligible scope items.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* COL 3: REWARD & CONFLICTS (3 Units) */}
                <div className="lg:col-span-3 flex flex-col h-full space-y-2 overflow-hidden">
                    <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden min-h-0 max-h-[35vh] lg:max-h-none">
                        <div className="flex justify-between items-center mb-1.5">
                            <h3 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider opacity-60">Reward Benefit</h3>
                            {['Volume', 'Override'].includes(benefitType) && !readOnly && (
                                <button
                                    onClick={() => setBenefitTiers([...benefitTiers, { minQty: 1, type: 'Percentage', value: 0 }])}
                                    className="text-[11px] font-bold text-blue-600 hover:underline uppercase"
                                >
                                    + Add Tier
                                </button>
                            )}
                        </div>
                        <div className="flex-1 bg-gray-50/50 rounded-lg p-2 border border-gray-100 flex flex-col overflow-hidden">
                            {benefitType === 'Percentage' && (
                                <div className="space-y-2 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-3">
                                        <TextInputNew1 name="Discount %" type="number" value={benefitPercentage} setValue={setBenefitPercentage} readOnly={readOnly} />
                                        <TextInputNew1 name="Max Cap (₹)" type="number" value={benefitMaxDiscount} setValue={setBenefitMaxDiscount} readOnly={readOnly} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Applicable On</label>
                                        <div className="flex flex-col gap-1.5">
                                            {['Each line', 'Entire document', 'Cheapest item'].map(opt => (
                                                <button key={opt} onClick={() => setBenefitApplyOn(opt)} className={`px-3 py-2 rounded text-[11px] font-bold uppercase transition-all text-left flex justify-between items-center ${benefitApplyOn === opt ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-200'}`}>
                                                    {opt}
                                                    {benefitApplyOn === opt && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {benefitType === 'Fixed' && (
                                <div className="space-y-2 overflow-y-auto">
                                    <TextInputNew1 name="Flat Amount Off (₹)" type="number" value={benefitAmount} setValue={setBenefitAmount} readOnly={readOnly} />
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Applicable On</label>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {['Entire document', 'Each line'].map(opt => (
                                                <button key={opt} onClick={() => setBenefitApplyOn(opt)} className={`px-3 py-2 rounded text-[11px] font-bold uppercase transition-all text-left flex justify-between items-center ${benefitApplyOn === opt ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-slate-300'}`}>
                                                    {opt}
                                                    {benefitApplyOn === opt && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {['Volume', 'Override'].includes(benefitType) && (
                                <div className="flex flex-col h-full overflow-hidden">
                                    <div className="flex-1 overflow-auto bg-white rounded border border-gray-100 shadow-inner mb-1">
                                        <table className="w-full text-left text-[10px]">
                                            <thead className="text-gray-400 uppercase font-bold text-[9px] tracking-widest border-b border-gray-50 sticky top-0 bg-white z-10">
                                                <tr><th className="p-1.5">Min Qty</th><th className="p-1.5">Reward</th><th className="p-1.5 text-right">Value</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {(benefitTiers || []).map((tier, idx) => (
                                                    <tr key={idx} className="hover:bg-blue-50/50">
                                                        <td className="p-1.5 font-bold"><input type="number" value={tier.minQty} onChange={(e) => updateTier(idx, 'minQty', e.target.value)} className="w-10 bg-transparent focus:ring-0 text-gray-700 text-[9px]" /></td>
                                                        <td className="p-1.5">
                                                            <div className="flex bg-gray-100 p-0.5 rounded w-fit">
                                                                {[{ l: '%', v: 'Percentage' }, { l: '₹', v: 'Fixed' }].map(t => (
                                                                    <button
                                                                        key={t.v}
                                                                        onClick={() => !readOnly && updateTier(idx, 'type', t.v)}
                                                                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${tier.type === t.v ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-500'}`}
                                                                    >
                                                                        {t.l}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="p-1.5 text-right font-bold text-indigo-700 text-[9px]"><input type="number" value={tier.value} onChange={(e) => updateTier(idx, 'value', e.target.value)} className="w-12 bg-transparent text-right focus:ring-0 text-[9px]" /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );

    return (
        <MasterPageLayout title="Offers & Promotions" onAdd={onNew} addButtonLabel="+ Add New Offer">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
                <ReusableTable columns={columns} data={allData?.data} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} itemsPerPage={12} isLoading={isLoading || isFetching} />
            </div>

            {form && (
                <Modal isOpen={form} form={form} widthClass="w-[95%] h-[98vh]" onClose={() => { setForm(false); setId(""); }}>
                    <div className="h-full flex flex-col bg-gray-200">
                        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white rounded-t-lg">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {id ? (readOnly ? "View Promotion" : "Edit Promotion") : "Add New Promotion"}
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={() => setForm(false)} className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded transition-all">Cancel</button>
                                {!readOnly && (
                                    <button
                                        onClick={() => saveData("close")}
                                        // disabled={!isFormValid}
                                        ref={saveCloseButtonRef}
                                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs transition-all disabled:opacity-50"
                                    >
                                        <Check size={14} /> {id ? "Update" : "Save & Close"}
                                    </button>
                                )}
                                {(!readOnly && !id) && (
                                    <button
                                        onClick={() => saveData("new")}
                                        // disabled={!isFormValid}
                                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs transition-all disabled:opacity-50"
                                    >
                                        <Check size={14} /> Save & New
                                    </button>
                                )}
                            </div>
                        </div>
                        {formBody}
                    </div>
                </Modal>
            )}

            {showSelectionModal && (
                <Modal isOpen={showSelectionModal} widthClass="w-[70%] h-[80vh]" onClose={() => setShowSelectionModal(false)}>
                    <div className="h-full flex flex-col bg-gray-100">
                        <div className="p-4 bg-white border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Select {scope}s</h2>
                                <p className="text-[10px] text-gray-400 uppercase font-black">Managing targeting for: {name || 'this promotion'}</p>
                            </div>
                            <button onClick={() => setShowSelectionModal(false)} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden p-4 grid grid-cols-12 gap-4">
                            {/* LEFT: SEARCH & SELECT */}
                            <div className="col-span-12 lg:col-span-7 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
                                <div className="p-3 border-b bg-gray-50">
                                    <input
                                        type="text"
                                        placeholder={`Search ${scope}s...`}
                                        className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={selectionSearch}
                                        onChange={(e) => setSelectionSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1 overflow-auto p-2">
                                    <div className="grid grid-cols-1 gap-1">
                                        {(scope === 'Item' ? itemOptions : collectionOptions)
                                            .filter(opt => opt.label?.toLowerCase().includes(selectionSearch.toLowerCase()))
                                            .map(opt => {
                                                const isSelected = scopeSelection.some(s => s.value === opt.value);
                                                return (
                                                    <div
                                                        key={opt.value}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setScopeSelection(scopeSelection.filter(s => s.value !== opt.value));
                                                            } else {
                                                                setScopeSelection([...scopeSelection, opt]);
                                                            }
                                                        }}
                                                        className={`p-2.5 rounded border-b  cursor-pointer flex items-center justify-between transition-all ${isSelected ? 'bg-indigo-50/50 border-indigo-200' : 'hover:bg-gray-50 border-transparent'}`}
                                                    >
                                                        <span className={`text-xs font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`}>{opt.label}</span>
                                                        {isSelected ? <div className="bg-indigo-600 text-white rounded-full p-0.5"><Check size={10} /></div> : <div className="w-4 h-4 rounded-full border border-gray-200" />}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: SELECTED PREVIEW */}
                            <div className="col-span-12 lg:col-span-5 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden text-[11px]">
                                <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                                    <span className="font-bold uppercase tracking-widest text-gray-500 text-[10px]">Selected ({scopeSelection.length})</span>
                                    <button onClick={() => setScopeSelection([])} className="text-red-500 hover:underline font-bold text-[9px] uppercase">Clear All</button>
                                </div>
                                <div className="flex-1 overflow-auto bg-gray-50/30">
                                    {scopeSelection.map(s => (
                                        <div key={s.value} className="p-2 border-b flex justify-between items-center bg-white m-1 rounded shadow-sm">
                                            <span className="font-medium text-gray-700 truncate mr-2">{s.label}</span>
                                            <button onClick={() => setScopeSelection(scopeSelection.filter(item => item.value !== s.value))} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {scopeSelection.length === 0 && (
                                        <div className="h-full flex items-center justify-center p-10 text-center text-gray-400 italic">
                                            No selections made. This promotion will not target specific {scope}s.
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t bg-gray-50">
                                    <button onClick={() => setShowSelectionModal(false)} className="w-full py-2 bg-indigo-600 text-white rounded font-bold uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Confirm Selection</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
            {showPreview && (
                <Modal isOpen={showPreview} widthClass="w-[60%] h-[auto] max-h-[85vh]" onClose={() => setShowPreview(false)}>
                    <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 text-white flex justify-between items-center border-b border-indigo-700/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
                                    <Sparkles size={24} className="text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight uppercase leading-none">{previewItem?.name}</h2>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1 inline-block">Offer Intelligence Summary</span>
                                </div>
                            </div>
                            <button onClick={() => setShowPreview(false)} className="p-2 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full border border-white/10">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-gray-50/50 space-y-6 overflow-y-auto max-h-[60vh]">
                            {/* Visual Logic Row */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3"><Globe size={20} /></div>
                                    <h4 className="font-black text-[10px] uppercase text-gray-400 tracking-wider mb-1">Applicability</h4>
                                    <p className="text-xs font-bold text-gray-700">{previewItem?.scopeMode === 'Global' ? 'Store-Wide' : previewItem?.scopeMode}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3"><Settings size={20} /></div>
                                    <h4 className="font-black text-[10px] uppercase text-gray-400 tracking-wider mb-1">Offer Type</h4>
                                    <p className="text-xs font-bold text-gray-700">{previewItem?.discountType}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-full mb-3"><Package size={20} /></div>
                                    <h4 className="font-black text-[10px] uppercase text-gray-400 tracking-wider mb-1">Stacking</h4>
                                    <p className="text-xs font-bold text-gray-700">{previewItem?.stacking || 'Normal'}</p>
                                </div>
                            </div>

                            {/* Human Language Explanation */}
                            <div className="bg-indigo-50/50 border-l-4 border-indigo-600 rounded-lg p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info size={16} className="text-indigo-600" />
                                    <h3 className="text-sm font-black text-indigo-900 uppercase">How it works</h3>
                                </div>
                                <div className="space-y-4 text-gray-700 leading-relaxed text-[13px]">
                                    <p>
                                        This promotion targets <span className="font-black text-indigo-700 italic">
                                            {previewItem?.scopeMode === 'Global' ? 'every single product in the store' : `specific ${previewItem?.scopeMode}s (${previewItem?.OfferScope?.length || 0} items)`}
                                        </span>.
                                    </p>
                                    <p>
                                        It will be triggered when a customer meets <span className="font-black"> ALL </span> of the following conditions:
                                        <ul className="list-disc ml-5 mt-2 text-xs space-y-1">
                                            {(previewItem?.OfferRule?.[0]?.conditions?.rules || []).map((rule, idx) => (
                                                <li key={idx}>The {rule.field} is {rule.operator} {rule.value}</li>
                                            ))}
                                        </ul>
                                    </p>
                                    <div className="bg-white/60 p-4 rounded-lg border border-indigo-100 mt-2">
                                        <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2 flex items-center gap-1">
                                            <Sparkles size={10} /> Live Calculation Example
                                        </h4>
                                        <div className="text-xs font-medium space-y-2">
                                            {['Volume', 'Override'].includes(previewItem?.discountType) ? (
                                                <div>
                                                    <p className="mb-2">If a customer purchases different quantities, the reward scales as follows:</p>
                                                    <div className="grid grid-cols-2 gap-2 max-w-sm">
                                                        {(previewItem?.OfferTier || []).map((tier, idx) => (
                                                            <div key={idx} className="bg-indigo-900 text-white p-2 rounded-md flex justify-between">
                                                                <span className="font-bold">{tier.minQty}+ Items:</span>
                                                                <span className="font-black">-{tier.value}{tier.type === 'Percentage' ? '%' : '₹'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="p-3 bg-white border border-dashed border-gray-300 rounded text-center leading-relaxed">
                                                    "If I buy items worth <span className="font-bold text-indigo-700">₹1,000</span>, I will get <span className="bg-green-100 px-1 rounded font-black text-green-700 line-through decoration-red-400">₹{previewItem?.discountType === 'Percentage' ? (1000 * previewItem?.discountValue / 100) : previewItem?.discountValue}</span> off, paying only <span className="font-black text-indigo-950">₹{previewItem?.discountType === 'Percentage' ? (1000 - (1000 * previewItem?.discountValue / 100)) : (1000 - previewItem?.discountValue)}</span>."
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white border-t flex justify-between items-center">
                            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-tighter">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Valid from: {previewItem?.validFrom || 'Immediate'}
                            </div>
                            <button onClick={() => setShowPreview(false)} className="px-6 py-2 bg-indigo-950 text-white rounded-md font-bold uppercase tracking-widest text-[11px] hover:bg-black transition-all">Close Intelligence View</button>
                        </div>
                    </div>
                </Modal>
            )}
        </MasterPageLayout>
    );
};

export default OffersPromotions;

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useGetoffersPromotionsQuery, useGetoffersPromotionsByIdQuery, useAddoffersPromotionsMutation, useUpdateoffersPromotionsMutation, useDeleteoffersPromotionsMutation } from '../../redux/uniformService/Offer&PromotionsService';
import { useGetSizeMasterQuery } from "../../redux/uniformService/SizeMasterService";
import { useGetItemMasterQuery } from "../../redux/uniformService/ItemMasterService";
import { useGetItemCategoryQuery } from "../../redux/uniformService/ItemCategoryMasterService";
import { useGetcollectionsQuery } from "../../redux/uniformService/CollectionsService";
import secureLocalStorage from "react-secure-storage";
import Swal from 'sweetalert2';
import { Check, X, Trash2, Globe, Package, FolderTree, Power, Settings } from "lucide-react";
import {
    TextInputNew1,
    DropdownInputNew,
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
    { show: 'Volume Tiered', value: 'Volume' }
];

const SCOPE_OPTIONS = [
    { id: 'Global', label: 'Global', icon: Globe },
    { id: 'Collection', label: 'Collection', icon: FolderTree },
    { id: 'Item', label: 'Items', icon: Package },
];

const CONDITION_FIELDS = [
    { show: 'Min Total Qty', value: 'Minimum Quantity' },
    { show: 'Cart Value', value: 'Cart Value' },
    { show: 'Size Qty', value: 'Specific Size Quantity' },
    { show: 'Equal Ratio', value: 'Equal Ratio' }
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

const INITIAL_FORM_STATE = {
    name: "", code: "", description: "", benefitType: "Percentage",
    status: "Active", priority: 1, scope: "Global", scopeSelection: [],
    validFrom: new Date().toISOString().split('T')[0], validTo: "",
    noEndDate: true, conditions: [{ field: "Minimum Quantity", operator: ">=", value: 1 }],
    benefit: { percentage: 0, amount: 0, applyOn: 'Each line', tiers: [] },
    stacking: "Best Of",
    conditionLogic: "AND"
};

const OffersPromotions = () => {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [formState, setFormState] = useState(INITIAL_FORM_STATE);

    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [selectionSearch, setSelectionSearch] = useState("");

    const { refs, handlers } = useFormKeyboardNavigation();
    const { firstInputRef: nameRef, saveCloseButtonRef } = refs;

    const params = {
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        branchId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "branchId") || 1,
    };

    // --- Queries & Mutations ---
    const { data: sizes } = useGetSizeMasterQuery(params);
    const sizeOptions = useMemo(() => (sizes?.data || []).map(s => ({ show: s.name, value: s.id })), [sizes]);

    const { data: items } = useGetItemMasterQuery({ params });
    const itemOptions = useMemo(() => (items?.data || []).map(i => ({ label: i.name, value: i.id })), [items]);

    const { data: categories } = useGetItemCategoryQuery({ params });
    const categoryOptions = useMemo(() => (categories?.data || []).map(c => ({ label: c.name, value: c.id })), [categories]);

    const { data: collections } = useGetcollectionsQuery({ params });
    const collectionOptions = useMemo(() => (collections?.data || []).map(c => ({ label: c.name, value: c.id })), [collections]);

    const { data: allData, isLoading, isFetching } = useGetoffersPromotionsQuery({ params, searchParams: searchValue });
    const { data: singleData, isFetching: isSingleFetching } = useGetoffersPromotionsByIdQuery(id, { skip: !id });

    const [addData] = useAddoffersPromotionsMutation();
    const [updateData] = useUpdateoffersPromotionsMutation();
    const [removeData] = useDeleteoffersPromotionsMutation();

    // --- Helpers ---
    const updateState = (key, val) => setFormState(prev => ({ ...prev, [key]: val }));
    const updateCondition = (idx, key, val) => {
        const newConds = [...formState.conditions];
        newConds[idx] = { ...newConds[idx], [key]: val };
        updateState('conditions', newConds);
    };
    const updateBenefit = (key, val) => updateState('benefit', { ...formState.benefit, [key]: val });
    const updateTier = (idx, key, val) => {
        const newTiers = [...formState.benefit.tiers];
        newTiers[idx] = { ...newTiers[idx], [key]: val };
        updateBenefit('tiers', newTiers);
    };

    const syncFormWithDb = useCallback((data) => {
        if (data) {
            setFormState({
                ...INITIAL_FORM_STATE,
                ...data,
                status: data.active ? 'Active' : 'Inactive',
                noEndDate: !data.validTo,
                scope: data.scopeMode || "Global",
                scopeSelection: data.OfferScope ? data.OfferScope.map(s => {
                    const option = data.scopeMode === 'Item' ? itemOptions.find(i => i.value === s.refId) : collectionOptions.find(c => c.value === s.refId);
                    return option || { label: `ID: ${s.refId}`, value: s.refId };
                }) : [],
                conditions: data.OfferRule?.[0]?.conditions ? data.OfferRule[0].conditions : INITIAL_FORM_STATE.conditions,
                conditionLogic: data.OfferRule?.[0]?.logic || "AND",
                stacking: data.stacking || "Best Of",
                benefit: {
                    ...INITIAL_FORM_STATE.benefit,
                    percentage: (data.discountType === 'Percentage' ? data.discountValue : 0),
                    amount: (data.discountType === 'Fixed' ? data.discountValue : 0),
                    maxDiscount: data.maxDiscountValue || 0,
                    applyOn: data.applyOn || "Each line",
                    tiers: data.tiers ? (typeof data.tiers === 'string' ? JSON.parse(data.tiers) : data.tiers) : []
                }
            });
        } else {
            setFormState(INITIAL_FORM_STATE);
        }
    }, [itemOptions, collectionOptions]);

    useEffect(() => {
        if (singleData?.data && !isSingleFetching) {
            syncFormWithDb(singleData.data);
        }
    }, [singleData, isSingleFetching, syncFormWithDb]);

    const data = {
        ...formState,
        ...params,
        discountType: formState.benefitType,
        discountValue: formState.benefitType === 'Percentage' ? formState.benefit.percentage : formState.benefit.amount,
        maxDiscountValue: formState.benefit.maxDiscount,
        active: formState.status === 'Active',
        id,
        scope: formState.scope,
        scopeSelection: formState.scopeSelection,
        validFrom: formState.validFrom,
        validTo: formState.validTo,
        priority: formState.priority,
        description: formState.description,
        tiers: JSON.stringify(formState.benefit.tiers || []),
        selectionIds: JSON.stringify(formState.scopeSelection || [])
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
        const finalData = { ...data };

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

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', text: "Permanent Action", icon: 'warning', showCancelButton: true, confirmButtonColor: '#0f172a' });
        if (result.isConfirmed) {
            try { await removeData(id).unwrap(); Swal.fire('Deleted!', '', 'success'); }
            catch (err) { Swal.fire('Error', 'Deletion failed.', 'error'); }
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

    const isFormValid = formState.name && formState.code && formState.validFrom;

    // --- Row components ---
    const ACTIVE = (<div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white"><Power size={10} /></div>);
    const INACTIVE = (<div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white"><Power size={10} /></div>);

    const columns = [
        { header: "S.No", accessor: (item, index) => index + 1, className: "w-12 text-center" },
        { header: "Offer Name", accessor: (item) => item.name, className: "text-left font-bold" },
        { header: "Type", accessor: (item) => item.discountType, className: "text-left" },
        { header: "Value", accessor: (item) => (item.discountType === 'Percentage' ? `${item.discountValue}%` : `₹${item.discountValue}`), className: "text-right font-black" },
        { header: "Status", accessor: (item) => (item.active ? ACTIVE : INACTIVE), className: "w-16 text-center" }
    ];

    const formBody = (
        <div className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">

                {/* COL 1: IDENTITY & TIMELINE (2 Units) */}
                <div className="lg:col-span-2 space-y-3 flex flex-col h-full">
                    <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-2 text-[11px] uppercase tracking-wider opacity-60">Identity</h3>
                        <div className="space-y-3">
                            <TextInputNew1 ref={nameRef} name="Offer Name" value={formState.name} setValue={(v) => updateState('name', v)} readOnly={readOnly} required />
                            <TextInputNew1 name="Code" value={formState.code} setValue={(v) => updateState('code', v)} readOnly={readOnly} required />
                            <DropdownInputNew name="Offer Type" options={OFFER_TYPES} value={formState.benefitType} setValue={(v) => updateState('benefitType', v)} readOnly={readOnly} />
                            <TextInputNew1 name="Priority" type="number" value={formState.priority} setValue={(v) => updateState('priority', v)} readOnly={readOnly} />
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-2 text-[11px] uppercase tracking-wider opacity-60">Timeline</h3>
                        <div className="space-y-3 mb-2">
                            <TextInputNew1 name="Starts From" type="date" value={formState.validFrom} setValue={(v) => updateState('validFrom', v)} readOnly={readOnly} required />
                            <div className="space-y-1">
                                <TextInputNew1 name="Ends At" type="date" value={formState.validTo} setValue={(v) => updateState('validTo', v)} readOnly={readOnly || formState.noEndDate} disabled={formState.noEndDate} />
                                <label className="flex items-center gap-2 cursor-pointer mt-1 pl-1">
                                    <input type="checkbox" checked={formState.noEndDate} onChange={(e) => updateState('noEndDate', e.target.checked)} disabled={readOnly} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Running Forever</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm mt-auto">
                        <h3 className="font-bold text-gray-800 mb-2 text-[11px] uppercase tracking-wider opacity-60">Status</h3>
                        <ToggleButton name="Is Active" value={formState.status === 'Active'} setActive={(v) => updateState('status', v ? 'Active' : 'Inactive')} readOnly={readOnly} />
                    </div>
                </div>

                {/* COL 2: SCOPE & RULES (7 Units) - Table Structure */}
                <div className="lg:col-span-7 flex flex-col h-full space-y-3">
                    <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex flex-col">
                        <h3 className="font-bold text-gray-800 mb-3 text-[11px] uppercase tracking-wider opacity-60">Targeting Strategy</h3>
                        <table className="w-full text-[11px] border-collapse">
                            <tbody>
                                <tr className="border-b border-gray-50">
                                    <td className="py-2 px-1 font-bold text-gray-400 uppercase w-20 text-[9px]">Scope Mode</td>
                                    <td className="py-2 px-1">
                                        <div className="grid grid-cols-3 gap-2">
                                            {SCOPE_OPTIONS.map(opt => (
                                                <div key={opt.id} onClick={() => !readOnly && updateState('scope', opt.id)} className={`p-1 rounded border-2 text-center cursor-pointer transition-all ${formState.scope === opt.id ? 'border-indigo-600 bg-indigo-50 shadow-sm text-indigo-700' : 'border-gray-50 bg-gray-50 hover:bg-white'}`}>
                                                    <div className="flex justify-center mb-0.5"><opt.icon size={11} /></div>
                                                    <div className="text-[9px] font-bold uppercase">{opt.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                                {formState.scope !== 'Global' && (
                                    <tr>
                                        <td className="py-3 px-1 font-bold text-gray-400 uppercase align-top text-[9px]">Scope Target</td>
                                        <td className="py-2 px-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowSelectionModal(true)}
                                                className="w-full py-2 px-3 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 font-bold text-[10px] uppercase hover:bg-indigo-100 transition-all flex justify-between items-center"
                                            >
                                                <span>{formState.scopeSelection?.length || 0} {formState.scope}s Included</span>
                                                <Settings size={12} className="opacity-50" />
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
                        <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-gray-800 text-[13px] uppercase tracking-wider opacity-60">Eligibility Rules</h3>
                                <div className="flex bg-gray-200 p-0.5 rounded-md">
                                    {['AND', 'OR'].map(logic => (
                                        <button
                                            key={logic}
                                            onClick={() => !readOnly && updateState('conditionLogic', logic)}
                                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${formState.conditionLogic === logic ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {logic === 'AND' ? 'Match All' : 'Match Any'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {!readOnly && (
                                <button
                                    onClick={() => updateState('conditions', [...formState.conditions, { field: "Minimum Quantity", operator: ">=", value: 1 }])}
                                    className="text-[11px] font-bold text-blue-600 hover:underline uppercase"
                                >
                                    + Add Rule
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-[12px] text-left table-fixed">
                                <thead className="bg-gray-100/80 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-2 border-b font-bold text-gray-500 uppercase tracking-tighter text-[10px] w-12 text-center">S.No</th>
                                        <th className="p-2 border-b font-bold text-gray-500 uppercase tracking-tighter text-[10px] w-48">Condition</th>
                                        <th className="p-2 border-b font-bold text-gray-500 uppercase tracking-tighter text-[10px] w-40 text-center">Operation</th>
                                        <th className="p-2 border-b font-bold text-gray-500 uppercase tracking-tighter text-[10px] w-64 text-center">Value</th>
                                        {!readOnly && <th className="p-2 border-b font-bold text-gray-500 uppercase tracking-tighter text-[10px] w-10 text-center"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {formState.conditions.map((cond, idx) => (
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
                                                    {cond.field === 'Specific Size Quantity' ? (
                                                        <div className="flex gap-2 items-center">
                                                            <div className="flex-1">
                                                                <DropdownInputNew labelHidden={true} options={sizeOptions} value={cond.sizeId} setValue={(v) => updateCondition(idx, 'sizeId', v)} readOnly={readOnly} placeholder="Size" />
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
                                                        <TextInputNew1 labelHidden={true} type="number" value={cond.value} setValue={(v) => updateCondition(idx, 'value', v)} readOnly={readOnly} />
                                                    )}
                                                </div>
                                            </td>
                                            {!readOnly && (
                                                <td className="p-1 text-center">
                                                    <button
                                                        onClick={() => updateState('conditions', formState.conditions.filter((_, i) => i !== idx))}
                                                        className="text-red-300 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {formState.conditions.length === 0 && (
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
                <div className="lg:col-span-3 flex flex-col h-full space-y-3">
                    <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-3 text-[13px] uppercase tracking-wider opacity-60">Stacking Logic</h3>
                        <div className="space-y-1.5">
                            {STACKING_RULES.map(rule => (
                                <div key={rule.value} onClick={() => !readOnly && updateState('stacking', rule.value)} className={`px-3 py-2.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${formState.stacking === rule.value ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm' : 'border-gray-100 text-gray-500 bg-gray-50/30 hover:bg-white'}`}>
                                    <span className="text-[12px] font-bold uppercase tracking-wider">{rule.label}</span>
                                    {formState.stacking === rule.value && <div className="bg-blue-600 rounded-full p-1 text-white"><Check size={8} /></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
                        <h3 className="font-bold text-gray-800 mb-2 text-[13px] uppercase tracking-wider opacity-60">Reward Benefit</h3>
                        <div className="flex-1 bg-gray-50/50 rounded-lg p-3 border border-gray-100 flex flex-col">
                            {formState.benefitType === 'Percentage' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <TextInputNew1 name="Discount %" type="number" value={formState.benefit.percentage} setValue={(v) => updateBenefit('percentage', v)} readOnly={readOnly} />
                                        <TextInputNew1 name="Max Cap (₹)" type="number" value={formState.benefit.maxDiscount} setValue={(v) => updateBenefit('maxDiscount', v)} readOnly={readOnly} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Applicable On</label>
                                        <div className="flex flex-col gap-1.5">
                                            {['Each line', 'Entire document', 'Cheapest item'].map(opt => (
                                                <button key={opt} onClick={() => updateBenefit('applyOn', opt)} className={`px-3 py-2 rounded text-[11px] font-bold uppercase transition-all text-left flex justify-between items-center ${formState.benefit.applyOn === opt ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-200'}`}>
                                                    {opt}
                                                    {formState.benefit.applyOn === opt && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {formState.benefitType === 'Fixed' && (
                                <div className="space-y-4">
                                    <TextInputNew1 name="Flat Amount Off (₹)" type="number" value={formState.benefit.amount} setValue={(v) => updateBenefit('amount', v)} readOnly={readOnly} />
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Applicable On</label>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {['Entire document', 'Each line'].map(opt => (
                                                <button key={opt} onClick={() => updateBenefit('applyOn', opt)} className={`px-3 py-2 rounded text-[11px] font-bold uppercase transition-all text-left flex justify-between items-center ${formState.benefit.applyOn === opt ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-slate-300'}`}>
                                                    {opt}
                                                    {formState.benefit.applyOn === opt && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {formState.benefitType === 'Volume' && (
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 overflow-auto bg-white rounded border border-gray-100 shadow-inner mb-2">
                                        <table className="w-full text-left text-[11px]">
                                            <thead className="text-gray-400 uppercase font-black tracking-widest border-b border-gray-50 sticky top-0 bg-white z-10">
                                                <tr><th className="p-2">Min Qty</th><th className="p-2">Reward</th><th className="p-2 text-right">Value</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {(formState.benefit.tiers || []).map((tier, idx) => (
                                                    <tr key={idx} className="hover:bg-blue-50/50">
                                                        <td className="p-2 font-bold"><input type="number" value={tier.minQty} onChange={(e) => updateTier(idx, 'minQty', e.target.value)} className="w-12 bg-transparent focus:ring-0 text-gray-700" /></td>
                                                        <td className="p-2 text-gray-500 uppercase">{tier.type === 'Percentage' ? 'Percent' : 'Amount'}</td>
                                                        <td className="p-2 text-right font-black text-indigo-700"><input type="number" value={tier.value} onChange={(e) => updateTier(idx, 'value', e.target.value)} className="w-16 bg-transparent text-right focus:ring-0" /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {!readOnly && <button onClick={() => updateBenefit('tiers', [...(formState.benefit.tiers || []), { minQty: 1, type: 'Percentage', value: 0 }])} className="w-full py-2 text-[11px] font-bold text-gray-500 border border-dashed border-gray-300 rounded hover:bg-gray-100 hover:text-black transition-all uppercase">+ Add Tier</button>}
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
                <Modal isOpen={form} form={form} widthClass="w-[90%] h-[98vh]" onClose={() => setForm(false)}>
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
                                <h2 className="text-lg font-bold text-gray-800">Select {formState.scope}s</h2>
                                <p className="text-[10px] text-gray-400 uppercase font-black">Managing targeting for: {formState.name || 'this promotion'}</p>
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
                                        placeholder={`Search ${formState.scope}s...`}
                                        className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={selectionSearch}
                                        onChange={(e) => setSelectionSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1 overflow-auto p-2">
                                    <div className="grid grid-cols-1 gap-1">
                                        {(formState.scope === 'Item' ? itemOptions : collectionOptions)
                                            .filter(opt => opt.label?.toLowerCase().includes(selectionSearch.toLowerCase()))
                                            .map(opt => {
                                                const isSelected = formState.scopeSelection.some(s => s.value === opt.value);
                                                return (
                                                    <div
                                                        key={opt.value}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                updateState('scopeSelection', formState.scopeSelection.filter(s => s.value !== opt.value));
                                                            } else {
                                                                updateState('scopeSelection', [...formState.scopeSelection, opt]);
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
                                    <span className="font-bold uppercase tracking-widest text-gray-500 text-[10px]">Selected ({formState.scopeSelection.length})</span>
                                    <button onClick={() => updateState('scopeSelection', [])} className="text-red-500 hover:underline font-bold text-[9px] uppercase">Clear All</button>
                                </div>
                                <div className="flex-1 overflow-auto bg-gray-50/30">
                                    {formState.scopeSelection.map(s => (
                                        <div key={s.value} className="p-2 border-b flex justify-between items-center bg-white m-1 rounded shadow-sm">
                                            <span className="font-medium text-gray-700 truncate mr-2">{s.label}</span>
                                            <button onClick={() => updateState('scopeSelection', formState.scopeSelection.filter(item => item.value !== s.value))} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {formState.scopeSelection.length === 0 && (
                                        <div className="h-full flex items-center justify-center p-10 text-center text-gray-400 italic">
                                            No selections made. This promotion will not target specific {formState.scope}s.
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
        </MasterPageLayout>
    );
};

export default OffersPromotions;

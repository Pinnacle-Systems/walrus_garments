import { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useInvalidateTags from '../../CustomHooks/useInvalidateTags';
import { Check, Power } from "lucide-react";
import { ReusableTable, TextInputNew1, ToggleButton } from "../../Inputs";
import Modal from "../../UiComponents/Modal";
import { statusDropdown } from "../../Utils/DropdownData";
import { useAddItemCategoryMutation, useDeleteItemCategoryMutation, useGetItemCategoryByIdQuery, useGetItemCategoryQuery, useUpdateItemCategoryMutation } from "../../redux/uniformService/ItemCategoryMasterService";

export default function Form({ onSuccess, onClose, editId, deleteId, deleteLabel } = {}) {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState(editId || deleteId || "");
    const [name, setName] = useState("");
    const [active, setActive] = useState(true);
    const [searchValue, setSearchValue] = useState("");

    const nameRef = useRef(null);
    const childRecord = useRef(0);
    const formRef = useRef(null);

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const { data: allData } = useGetItemCategoryQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetItemCategoryByIdQuery(id, { skip: !id });

    const [addData] = useAddItemCategoryMutation();
    const [updateData] = useUpdateItemCategoryMutation();
    const [removeData] = useDeleteItemCategoryMutation();
    const [dispatchInvalidate] = useInvalidateTags();

    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            setName("");
            setActive(true);
            childRecord.current = 0;
        } else {
            setName(data?.name || "");
            setActive(id ? (data?.active ?? false) : true);
            childRecord.current = data?.childRecord ?? 0;
        }
    }, [id]);

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, active,
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
    };

    const validateData = (data) => !!data.name;

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id);
            if (onSuccess) {
                onSuccess(returnData.data.id);
                return;
            }
            dispatchInvalidate();
            await Swal.fire({ title: text + " Successfully", icon: "success" });
            if (nextProcess === "new") {
                syncFormWithDb(undefined);
                onNew();
            } else {
                setForm(false);
            }
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "Submission error",
                text: error.data?.message || "Something went wrong!",
            });
            nameRef.current?.focus();
        }
    };

    const saveData = (nextProcess) => {
        const upperName = name.toUpperCase();
        const finalData = { ...data, name: upperName };

        if (!validateData(finalData)) {
            Swal.fire({ title: "Please fill all required fields...!", icon: "error" });
            nameRef.current?.focus();
            return;
        }

        let foundItem;
        if (id) {
            foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item.name.toUpperCase() === upperName);
        } else {
            foundItem = allData?.data?.some(item => item.name.toUpperCase() === upperName);
        }
        if (foundItem) {
            Swal.fire({ text: "The Item Category already exists.", icon: "warning" });
            nameRef.current?.focus();
            return false;
        }
        if (id) {
            if (!window.confirm("Are you sure update the details ...?")) {
                return;
            }
        } if (id) {
            handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, finalData, "Added", nextProcess);
        }
    };

    const deleteData = async (id) => {
        if (!id) return;
        if (!window.confirm("Are you sure to delete...?")) return;
        try {
            let deldata = await removeData(id).unwrap();
            if (deldata?.statusCode == 1) {
                toast.error(deldata?.message);
                return;
            }
            setId("");
            dispatchInvalidate();
            await Swal.fire({ title: "Deleted Successfully", icon: "success" });
            setForm(false);
        } catch (error) {
            toast.error("Something went wrong");
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
        syncFormWithDb(undefined);
        setReadOnly(false);
        setTimeout(() => { nameRef.current?.focus(); }, 100);
    };

    const handleView = (id) => { setId(id); setForm(true); setReadOnly(true); };
    const handleEdit = (id) => { setId(id); setForm(true); setReadOnly(false); };

    const ACTIVE = (
        <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
            <Power size={10} />
        </div>
    );
    const INACTIVE = (
        <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
            <Power size={10} />
        </div>
    );

    const columns = [
        { header: "S.No", accessor: (item, index) => index + 1, className: "font-medium text-gray-900 w-12 text-center" },
        { header: "Item Category Name", accessor: (item) => item?.name, className: "font-medium text-gray-900 text-left uppercase w-72" },
        { header: "Status", accessor: (item) => (item.active ? ACTIVE : INACTIVE), className: "font-medium text-gray-900 text-center uppercase w-16" },
    ];

    useEffect(() => {
        if ((form || onSuccess) && nameRef.current) {
            nameRef.current.focus();
        }
    }, [form, onSuccess]);

    const formBody = (
        <div className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-1 gap-3 h-full">
                <div className="lg:col-span-2 space-y-3">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                        <div className="grid grid-cols-2 gap-3" ref={formRef}>
                            <TextInputNew1
                                name="Item Category Name"
                                type="text"
                                value={name}
                                setValue={setName}
                                required={true}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                ref={nameRef}
                            />

                        </div>
                        <div className="mt-5">
                            <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} readOnly={readOnly} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── deleteId render path ──────────────────────────────────────────────────
    if (deleteId) {
        const childCount = singleData?.data?.childRecord ?? 0;
        const isLoadingRecord = isSingleFetching || isSingleLoading;

        const handleConfirmDelete = async () => {
            try {
                const res = await removeData(deleteId).unwrap();
                if (res?.statusCode === 1) {
                    toast.error(res?.data?.message || "Cannot delete: child records exist");
                    return;
                }
                toast.success("Item Category deleted successfully");
                onSuccess?.();
            } catch (err) {
                toast.error(err?.data?.message || "Failed to delete Item Category");
            }
        };

        return (
            <div className="h-full flex flex-col bg-gray-200">
                <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">Delete Item Category</h2>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 rounded">
                    {isLoadingRecord ? (
                        <p className="text-xs text-gray-400">Checking records...</p>
                    ) : childCount > 0 ? (
                        <>
                            <div className="flex flex-col items-center gap-2">
                                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <p className="text-sm font-semibold text-red-600">Cannot Delete</p>
                                <p className="text-xs text-gray-600 text-center">
                                    <span className="font-semibold">"{deleteLabel}"</span> has{" "}
                                    <span className="font-semibold text-red-600">{childCount} linked item{childCount > 1 ? "s" : ""}</span>.
                                    Remove them first before deleting this category.
                                </p>
                            </div>
                            <button type="button" onClick={onClose}
                                className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded">
                                Close
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-700 text-center">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold">"{deleteLabel}"</span>?
                            </p>
                            <div className="flex gap-3">
                                <button type="button" onClick={onClose}
                                    className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleConfirmDelete}
                                    className="px-4 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded">
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ── onSuccess (inline add/edit) render path ───────────────────────────────
    if (onSuccess) {
        return (
            <div onKeyDown={handleKeyDown} className="h-full flex flex-col bg-gray-200">
                <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                        {editId ? "Edit Item Category" : "Add New Item Category"}
                    </h2>
                    <button
                        type="button"
                        onClick={() => saveData("close")}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
                    >
                        <Check size={14} />
                        {editId ? "Update" : "Save"}
                    </button>
                </div>
                {formBody}
            </div>
        );
    }

    // ── default (standalone page) render path ────────────────────────────────
    return (
        <div onKeyDown={handleKeyDown} className="p-1">
            <div className="w-full flex bg-white p-1 justify-between items-center">
                <h5 className="text-2xl font-bold text-gray-800">Item Category Master</h5>
                <button
                    onClick={() => { setForm(true); onNew(); }}
                    className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                >
                    + Add New Category
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
                <ReusableTable
                    columns={columns}
                    data={allData?.data}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={deleteData}
                    itemsPerPage={10}
                />
            </div>

            {form && (
                <Modal isOpen={form} widthClass="w-[40%] h-[40%]" onClose={() => setForm(false)}>
                    <div className="h-full flex flex-col bg-gray-200">
                        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                            <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                                {id ? (!readOnly ? "Edit Item Category" : "Item Category") : "Add New Item Category"}
                            </h2>
                            <div className="flex gap-2">
                                {readOnly && (
                                    <button type="button"
                                        onClick={() => { setForm(false); setSearchValue(""); setId(false); }}
                                        className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded">
                                        Cancel
                                    </button>
                                )}
                                {!readOnly && (
                                    <button type="button" onClick={() => saveData("close")}
                                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs">
                                        <Check size={14} />
                                        {id ? "Update" : "Save & Close"}
                                    </button>
                                )}
                                {!readOnly && !id && (
                                    <button type="button" onClick={() => saveData("new")}
                                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs">
                                        <Check size={14} />
                                        Save & New
                                    </button>
                                )}
                            </div>
                        </div>
                        {formBody}
                    </div>
                </Modal>
            )}
        </div>
    );
}

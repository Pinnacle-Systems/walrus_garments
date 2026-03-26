import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetItemTypeMasterQuery,
    useGetItemTypeMasterByIdQuery,
    useAddItemTypeMasterMutation,
    useUpdateItemTypeMasterMutation,
    useDeleteItemTypeMasterMutation,
} from "../../../redux/uniformService/ItemTypeMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox } from "../../../Inputs";
import ReportTemplate from '../../../Basic/components/ReportTemplate'

const MODEL = "Item Type Master";

export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [active, setActive] = useState(true);
    const [typeMethod, setTypeMethod] = useState(false);
    const [isBottom, setIsBottom] = useState(false);
    const [isTop, setIsTop] = useState(false);

    const [searchValue, setSearchValue] = useState("");
    const nameRef = useRef(null);
    const childRecord = useRef(0);


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetItemTypeMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetItemTypeMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddItemTypeMasterMutation();
    const [updateData] = useUpdateItemTypeMasterMutation();
    const [removeData] = useDeleteItemTypeMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            setName(data?.name ? data.name : "");
            setActive(id ? (data?.active ? data.active : false) : true);
            setTypeMethod(data?.typeMethod ? data.typeMethod : false);
            setIsBottom(data?.isBottom ? data.isBottom : false);
            setIsTop(data?.isTop ? data.isTop : false);
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, active, isTop, isBottom, typeMethod, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        if (data.name && (data?.isTop || data?.isBottom)) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            await callback(data).unwrap();
            setId("")
            syncFormWithDb(undefined)
            await Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",
            });
            onNew();
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Submission error',
                text: error.data?.message || 'Something went wrong!',
            });
            nameRef.current?.focus();
        }
    };

    const saveData = () => {
        const upperName = name.toUpperCase();
        const finalData = {
            ...data,
            name: upperName
        };

        if (!validateData(finalData)) {
            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "error",
            });
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
            Swal.fire({
                text: "The Item Type already exists.",
                icon: "warning",
            });
            nameRef.current?.focus();
            return false;
        }

        if (!window.confirm("Are you sure save the details ...?")) {
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, finalData, "Updated");
        } else {
            handleSubmitCustom(addData, finalData, "Added");
        }
    };

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                let returnData = await removeData(id).unwrap()
                if (returnData?.statusCode === 1) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Submission error',
                        text: returnData?.message || 'Something went wrong!',
                    });
                }
                else {
                    setId("");
                    await Swal.fire({
                        title: "Deleted Successfully",
                        icon: "success",
                    });
                    setForm(false);
                }
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Submission error',
                    text: error.data?.message || 'Something went wrong!',
                });
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
        setTimeout(() => {
            nameRef.current?.focus();
        }, 100);
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const tableHeaders = [
        "Name", "Status"
    ]
    const tableDataNames = ["dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE']

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
                onNew={onNew}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
            />
        );

    return (
        <div
            onKeyDown={handleKeyDown}
            className="md:items-start md:justify-items-center grid h-full bg-theme"
        >
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
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
                    <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
                        <div className='col-span-3 grid md:grid-cols-2 border overflow-auto'>
                            <div className='mr-1 md:ml-2'>
                                <fieldset className='frame my-1'>
                                    <legend className='sub-heading'>Item Type Info</legend>
                                    <div className='grid grid-cols-1 my-2'>
                                        <TextInput
                                            name="Item Type"
                                            type="text"
                                            value={name}
                                            setValue={setName}
                                            required={true}
                                            readOnly={readOnly}
                                            disabled={(childRecord.current > 0)}
                                            ref={nameRef}
                                        />
                                        <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
                                        {/* <CheckBox name="Top/Bottom" readOnly={readOnly} value={typeMethod} setValue={setTypeMethod} /> */}
                                        <CheckBox name="Top" readOnly={readOnly} value={isTop} setValue={setIsTop} />
                                        <CheckBox name="Bottom" readOnly={readOnly} value={isBottom} setValue={setIsBottom} />
                                    </div>
                                </fieldset>
                            </div>
                        </div>
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

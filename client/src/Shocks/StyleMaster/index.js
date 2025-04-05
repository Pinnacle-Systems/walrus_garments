import React, { useCallback, useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
// import { dropDownListObject, multiSelectOption } from '../../../Utils/contructObject';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { Modal, TextInput, ToggleButton } from '../../Inputs';
import BrowseSingleImage from '../../Basic/components/BrowseSingleImage';
import { useAddStyleMasterMutation, useDeleteStyleMasterMutation, useGetStyleMasterByIdQuery, useGetStyleMasterQuery, useUpdateStyleMasterMutation } from '../../redux/uniformService/StyleMasterService';
import { useGetFabricMasterQuery } from '../../redux/uniformService/FabricMasterService';
import { viewBase64String } from '../../Utils/helper';
import { useGetSizeTemplateQuery } from '../../redux/uniformService/SizeTemplateMasterServices';
import { useGetColorMasterQuery } from '../../redux/uniformService/ColorMasterService';
import { statusDropdown } from '../../Utils/DropdownData';
;

const MODEL = "Style Master"

const StyleMaster = () => {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [image, setImage] = useState("")
    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [productType, setProductType] = useState("");
    const [seoTitle, setSeoTitle] = useState("");
    const [sleeve, setSleeve] = useState("");
    const [pattern, setPattern] = useState("");
    const [occassion, setOccassion] = useState("");
    const [material, setMaterial] = useState("");
    const [washCare, setWashCare] = useState("");
    const [active, setActive] = useState(true);
    const [fabricId, setFabricId] = useState("");
    const [sizeTemplateId, setSizeTemplateId] = useState("")
    const [selectedColorsList, setSelectedColorsList] = useState([])
    const [portionDetails, setPortionDetails] = useState([]);
    const [hsn, setHsn] = useState("")

    const [errors, setErrors] = useState({});

    const [searchValue, setSearchValue] = useState("");

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const { data: fabricList } =
        useGetFabricMasterQuery({ params: { ...params, active: true } });

    const { data: allData, isLoading, isFetching } = useGetStyleMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetStyleMasterByIdQuery(id, { skip: !id });

    const [addData] = useAddStyleMasterMutation();
    const [updateData] = useUpdateStyleMasterMutation();
    const [removeData] = useDeleteStyleMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setImage("");
                setSku("");
                setHsn("");
                setProductType("");
                setName("");
                setSeoTitle("");
                setSleeve("");
                setFabricId("");
                setPattern("");
                setOccassion("");
                setMaterial("");
                setWashCare("");
                setActive(id ? (data?.active ?? true) : false);
                setSizeTemplateId("")
                setSelectedColorsList([])
                setPortionDetails([])
            } else {
                setReadOnly(true);
                setImage(data?.image ? viewBase64String(data.image) : "");
                setSku(data?.sku || "");
                setHsn(data?.hsn || "");
                setProductType(data?.productType || "");
                setName(data?.name || "");
                setSeoTitle(data?.seoTitle || "");
                setSleeve(data?.sleeve || "");
                setFabricId(data?.fabricId || "");
                setPattern(data?.pattern || "");
                setOccassion(data?.occassion || "");
                setMaterial(data?.material || "");
                setWashCare(data?.washCare || "");
                setActive(id ? (data?.active ?? false) : true);
                setSizeTemplateId(data?.sizeTemplateId || "")
                setSelectedColorsList(data?.StyleOnColor ? data.StyleOnColor.map(item => {
                    return { value: item.colorId, label: item.Color.name }
                }) : [])
                setPortionDetails(data?.portionDetails ? data.portionDetails : [])
            }
        },
        [id]
    );
    const { data: sizeTemplateList } = useGetSizeTemplateQuery({ params, searchParams: searchValue });
    const { data: colorList } =
        useGetColorMasterQuery({ params });
    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, sku, productType, name, seoTitle, sleeve, fabricId, sizeTemplateId,
        pattern, occassion, material, active, washCare, hsn,
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        if (data.name && data.sku && data.sizeTemplateId && data.fabricId) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            const formData = new FormData()
            for (let key in data) {
                formData.append(key, data[key]);
            }
            formData.append("selectedColorsList", JSON.stringify(selectedColorsList.map(item => item.value)))
            formData.append("portionDetails", JSON.stringify(portionDetails))
            if (image instanceof File) {
                formData.append("image", image);
            } else if (!image) {
                formData.append("isDeleteImage", true);
            }
            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id, body: formData }).unwrap();
            } else {
                returnData = await callback(formData).unwrap();
            }
            setId(returnData.data.id)
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
        "S.NO", "SKU", "Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
    const tableDataNames = ["index+1", "dataObj.sku", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Style Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Size list'}
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
            {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%]"} onClose={() => { setForm(false); setErrors({}); }}>
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
                    <fieldset className=' rounded mt-2'>
                        <div className=''>
                            <div className='flex justify-between'>
                                <div>
                                    <div className="mb-3">
                                        <TextInput name="SKU / Style code" type="text" value={sku} setValue={setSku} required={true} readOnly={readOnly} />
                                    </div>
                                    <div className="mb-3">
                                        <TextInput name="Product Type" type="text" value={productType} setValue={setProductType} required={true} readOnly={readOnly} />
                                    </div>
                                    <div className="mb-3">
                                        <TextInput name="Item Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} />
                                        {/* <TextInput name="SEO Title" type="text" value={seoTitle} setValue={setSeoTitle} required={true} readOnly={readOnly} /> */}
                                    </div>
                                </div>
                                <div>
                                    <BrowseSingleImage picture={image} setPicture={setImage} readOnly={readOnly} />
                                </div>
                            </div>
                            <div className="mb-5">
                                <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                {/* <Portion readonly={readOnly} portionDetails={portionDetails} setPortionDetails={setPortionDetails} /> */}
                            </div>

                        </div>
                    </fieldset>
                </MastersForm>
            </Modal>}

        </div>
    )
}

export default StyleMaster

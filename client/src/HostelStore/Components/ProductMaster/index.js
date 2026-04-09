import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';

import FormHeader from '../../../Basic/components/FormHeader';
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify"
import { TextInput, CheckBox, DropdownInput, TextArea } from "../../../Inputs"
import ReportTemplate from '../../../Basic/components/ReportTemplate';
import {
  useGetProductQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../../redux/services/ProductMasterService'
import Portion from './portion';
import { useGetProductBrandQuery } from '../../../redux/services/ProductBrandService'
import { useGetProductCategoryQuery } from '../../../redux/services/ProductCategoryServices'
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { dropDownListObject } from '../../../Utils/contructObject';
import { findFromList } from '../../../Utils/helper';
import { useGetProductSubCategoryQuery } from '../../../redux/services/ProductSubCategoryServices';
import { Description } from '@mui/icons-material';
import { useGetUserByIdQuery, useGetUserQuery } from '../../../redux/services/UsersMasterService';
import { useGetRolesQuery } from '../../../redux/services/RolesMasterService';

const MODEL = "Product  Master";

export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("")
  const [name, setName] = useState("");
  const [taxPercent, setTaxPercent] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [lowPrice, setLowPrice] = useState("");
  const [mediumPrice, setMediumPrice] = useState("");
  const [highPrice, setHighPrice] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [productBrandId, setProductBrandId] = useState("");
  const [uomId, setUomId] = useState("");
  const [hsnCode, setHsnCode] = useState("")

  const [productCategoryId, setProductCategoryId] = useState("");
  const [productSubCategoryId, setProductSubCategoryId] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);

  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }

  const { data: allData, isLoading, isFetching } = useGetProductQuery({ params, searchParams: searchValue });
  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetProductByIdQuery(id, { skip: !id });

  const [addData] = useAddProductMutation();
  const [updateData] = useUpdateProductMutation();
  const [removeData] = useDeleteProductMutation();



  const userId = {
    userId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId"
    ),
  };


  const {
    data: singleUserData,
  } = useGetUserByIdQuery(userId.userId, { skip: !userId.userId });

  const { data: rolesData } = useGetRolesQuery({ params });

  const { data: allUser } =
    useGetUserQuery({ params });



  const { data: productCategoryList } =
    useGetProductCategoryQuery({ params });

  const { data: productSubCategoryList } =
    useGetProductSubCategoryQuery({ params });

  const { data: uomList } = useGetUomQuery({ params })
  const syncFormWithDb = useCallback(
    (data) => {

      if (id) setReadOnly(true);
      setName(data?.name ? data.name : "");
      setTaxPercent(data?.taxPercent ? data.taxPercent : "");
      setPrice(data?.price ? data.price : "");
      setLowPrice(data?.lowPrice ? data?.lowPrice : "")
      setMediumPrice(data?.mediumPrice ? data?.mediumPrice : "")
      setHighPrice(data?.highPrice ? data?.highPrice : "")
      setCode(data?.code ? data.code : "");
      setActive(id ? (data?.active ? data.active : false) : true);
      setProductBrandId(data?.productBrandId ? data.productBrandId : "");
      setProductCategoryId(data?.productCategoryId ? data.productCategoryId : "");
      setProductSubCategoryId(data?.productSubCategoryId ? data.productSubCategoryId : "");
      setUomId(data?.uomId ? data?.uomId : "");
      setDescription(data?.description ? data?.description : "");
      setHsnCode(data?.hsnCode ? data?.hsnCode : "")
      // setProductUomPriceDetails(data?.ProductUomPriceDetails ? data.ProductUomPriceDetails : [])
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }, [id])


  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


  const data = {
    name, hsnCode, taxPercent, price, lowPrice, mediumPrice, highPrice, uomId, description,
    companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), active, id,
  }



  const validateData = (data) => {
    if (data.name && data.price) {
      return true;
    }
    return false;
  }

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      if (returnData.statusCode === 0) {
        setId("")
        syncFormWithDb(undefined)
        toast.success(text + "Successfully");
      } else {
        toast.error(returnData?.message)
      }
    } catch (error) {
      console.log("handle")
    }
  }

  const saveData = () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", { position: "top-center" })
      return
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated")
    } else {
      handleSubmitCustom(addData, data, "Added")
    }
  }

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return
      }
      try {
        let returnData = await removeData(id).unwrap();
        if (returnData.statusCode === 0) {
          setId("")
          syncFormWithDb(undefined)
          toast.success("Deleted Successfully");
        } else {
          toast.error(returnData?.message)
        }
      } catch (error) {
        toast.error("something went wrong")
      }
      ;
    }
  }

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === 's') {
      event.preventDefault();
      saveData();
    }
  }



  const onNew = () => { setId(""); setReadOnly(false); setForm(true); setSearchValue("") }

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  const isPurchasePrice = allUser?.data?.find(item => parseInt(item.id) == parseInt(userId?.userId))?.role?.purchasePrice || (allUser?.data?.find(item => parseInt(item.id) == parseInt(userId?.userId))?.role?.name == "DEFAULT ADMIN")

  const isPurchaseDept = allUser?.data?.find(item => parseInt(item.id) == parseInt(userId?.userId))?.role?.purchaseDepartment || (allUser?.data?.find(item => parseInt(item.id) == parseInt(userId?.userId))?.role?.name == "DEFAULT ADMIN")


  const tableHeaders = [
    "Name", "Status"
  ]
  const tableDataNames = ["dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE']

  if (!form)
    return <ReportTemplate
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

  return (
    <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>
      <div className='flex flex-col frame w-full h-full'>
        <FormHeader
          onNew={onNew}
          onClose={() => {
            setForm(false);
            setSearchValue("");
          }} model={MODEL}
          saveData={saveData} setReadOnly={setReadOnly}
          deleteData={deleteData}
        //  childRecord={childRecord.current}
        />
        <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
          <div className='col-span-3 grid md:grid-cols-1 border overflow-auto'>
            <div className='mr-1 md:ml-2'>
              <fieldset className='frame my-1'>
                <legend className='sub-heading'>Product Info</legend>
                <div className='grid grid-cols-3 my-2'>
                  {/* <DropdownInput name="Product Category" options={dropDownListObject(id ? productCategoryList?.data : productCategoryList?.data.filter(item => item.active), "name", "id")} value={productCategoryId} setValue={setProductCategoryId} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                  <DropdownInput name="Product Sub Category" options={dropDownListObject(id ? productSubCategoryList?.data : productSubCategoryList?.data.filter(val => parseInt(val.productCategoryId) === parseInt(productCategoryId)).filter(item => item.active), "name", "id")} value={productSubCategoryId} setValue={setProductSubCategoryId} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} /> */}
                  <TextInput name="Product Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                  <DropdownInput name="Uom" options={dropDownListObject(id ? uomList?.data : uomList?.data.filter(item => item.active), "name", "id")} value={uomId} setValue={setUomId} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                  <TextInput name="Tax" type="text" value={taxPercent} setValue={setTaxPercent} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                  <TextInput name="HSN" type="text" value={hsnCode} setValue={setHsnCode} readOnly={readOnly} disabled={(childRecord.current > 0)} />


                  {
                    isPurchaseDept &&
                    <TextInput name="Purchase Price" type="number" value={price} setValue={setPrice} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                  }





                  {/* <div className="grid grid-cols-2">

                    <Portion readonly={readOnly} ProductUomPriceDetails={ProductUomPriceDetails} setProductUomPriceDetails={setProductUomPriceDetails} disabled={(childRecord.current > 0)} />
                  </div> */}


                  <CheckBox name="Active" value={active} setValue={setActive} readOnly={readOnly} />


                </div>
              </fieldset>
              <div className='flex gap-x-4'>
                <div className='w-1/2'>



                  {/* <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-400 md:pb-5 flex flex-1 overflow-auto'>
                 <legend className='sub-heading'>Purchase-Price-Details</legend> */}


                  {
                    isPurchasePrice &&
                    <div className={` relative w-full overflow-y-auto p-1 mt-5`}>
                      <table className=" border border-gray-500 text-xs table-auto  w-3/4">
                        <thead className='bg-blue-200 top-0 border-b border-gray-500'>
                          <tr className=''>

                            <th className=" py-2"></th>
                            <th colSpan={3} className="border border-gray-500 py-2">Sales  %</th>


                          </tr>
                          <tr className=''>

                            <th className="tx-table-cell py-2">PURCHASE.PRICE<span className="text-red-500 p-0.5">*</span></th>
                            <th className="tx-table-cell  py-2">Economy %</th>
                            <th className="tx-table-cell  py-2">Standard %</th>
                            <th className="tx-table-cell  py-2">Premium %</th>

                          </tr>
                        </thead>
                        <tbody className='overflow-y-auto h-full w-full'>



                          <tr className="w-full tx-table-row">


                            <td className='tx-table-cell'>
                              <input
                                type="number"
                                className="text-right rounded py-2 px-1 w-full tx-table-input"

                                value={price ? price : 0}

                                disabled={readOnly}
                                onChange={(e) =>
                                  setPrice(e.target.value)
                                }
                              />
                            </td>
                            <td className='tx-table-cell'>
                              <input
                                type="text"
                                className="text-right rounded py-2 px-1 w-full tx-table-input"

                                value={lowPrice ? lowPrice : ""}
                                disabled={readOnly}
                                onChange={(e) =>
                                  setLowPrice(e.target.value)
                                }


                              />
                            </td>
                            <td className='tx-table-cell'>
                              <input
                                type="text"
                                className="text-right rounded py-2 px-1 w-full tx-table-input"

                                value={mediumPrice ? mediumPrice : ""}
                                disabled={readOnly}
                                onChange={(e) =>
                                  setMediumPrice(e.target.value)
                                }


                              />

                            </td>



                            <td className='tx-table-cell'>
                              <input
                                type="text"
                                className="text-right rounded py-2 px-1 w-full tx-table-input"

                                value={highPrice ? highPrice : ""}
                                disabled={readOnly}
                                onChange={(e) =>
                                  setHighPrice(e.target.value)
                                }


                              />
                            </td>

                          </tr>



                        </tbody>
                      </table>
                    </div>
                  }





                  {/* </fieldset> */}

                </div>



                <div className='w-1/2'>


                  <div className='flex w-full'>
                    <div className='mt-2 w-1/4 text-sm underline'>Description :</div>
                    <div className=' w-3/4'>

                      <textarea className=" w-full h-64 overflow-auto focus:outline-none border border-gray-500 rounded p-2 text-xs"
                        value={description} onChange={(e) => { setDescription(e.target.value) }} ></textarea>



                    </div>
                  </div>





                  {/* <TextArea autoFocus name={"Description"} value={description} setValue={setDescription} className={"w-full h-44"} /> */}

                </div>
              </div>
            </div>
          </div>
          <div className='frame overflow-x-hidden'>
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
  )
}

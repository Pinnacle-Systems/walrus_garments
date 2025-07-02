import React, { useEffect, useState, useRef, useCallback } from "react";


import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DisabledInput, DropdownInput, DateInput } from "../../../Inputs";
import { poTypes } from '../../../Utils/DropdownData';
import YarnPoItems from "./YarnPoItems";
import FabricPoItems from "./FabricPoItems";
import AccessoryPoItems from "./AccessoryPoItems"
import moment from "moment";
import Modal from "../../../UiComponents/Modal";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import PurchaseOrderFormReport from "./PurchaseOrderFormReport";
import {
  useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { dropDownListObject } from "../../../Utils/contructObject";
import StockReport from "./StockReport";
import { FaFileAlt, FaPlus } from "react-icons/fa";
import CommonTable from "../../../Shocks/CommonReport/CommonTable";
import { useAddRawMaterialOpeningStockMutation, useDeleteRawMaterialOpeningStockMutation, useGetRawMaterialOpeningStockByIdQuery, useGetRawMaterialOpeningStockQuery, useUpdateRawMaterialOpeningStockMutation } from "../../../redux/uniformService/RawMaterialOpeningStockServices";
import OpeningStockForm from "./OpeningStockForm";

const MODEL = "Raw Material Opening Stock";

export default function Form() {
  const today = new Date()
  const [readOnly, setReadOnly] = useState(false);
  const [rawMaterialOpeningStockItems, setRawMaterialOpeningStockItems] = useState([]);
  const [docId, setDocId] = useState("")
  const [id, setId] = useState("");
  const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
  const [storeId, setStoreId] = useState("")
  const [locationId, setLocationId] = useState('');
  const [viewReport,setViewReport ] = useState(false)
  const [rawMaterialType, setRawMaterialType] = useState("");

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);

  const { branchId, companyId, finYearId, userId } = getCommonParams()


    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showOpeningStock, setOpeningStock] = useState(false);
    const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectInward");
    

  const params = {
    branchId, companyId, finYearId
  };

  const { data: allData, isLoading, isFetching } = useGetRawMaterialOpeningStockQuery({ params, searchParams: searchValue });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: locationData } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });

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
  } = useGetRawMaterialOpeningStockByIdQuery(id, { skip: !id });
  
  const [addData] = useAddRawMaterialOpeningStockMutation();
  const [updateData] = useUpdateRawMaterialOpeningStockMutation();
  const [removeData] = useDeleteRawMaterialOpeningStockMutation();

  const syncFormWithDb = useCallback((data) => {
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    setLocationId(data?.Store?.locationId ? data?.Store?.locationId : "")
    setStoreId(data?.storeId ? data.storeId : "")
    setRawMaterialType(data?.rawMaterialType ? data.rawMaterialType : "");
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"));
    setRawMaterialOpeningStockItems(data?.RawMaterialOpeningStockItems ? data.RawMaterialOpeningStockItems.map(item => {
      let newItem = structuredClone(item);
      if (data.rawMaterialType === "GreyYarn" || data.rawMaterialType === "DyedYarn") {
        newItem["weightPerBag"] = parseFloat(newItem.qty) / parseFloat(newItem.noOfBags)
      }
      return newItem
    }) : []);
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
  }, [id]);


  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);
const columns = [
        {
            header: 'S.No',
            accessor: (item, index) => index + 1,
            cellClass: () => 'font-medium text-gray-900'
        },
        
        {
            header: 'Stock No.',
            accessor: (item) => item.docId,
            cellClass: () => 'font-medium text-gray-900'
        },
           {
            header: 'Raw Material Type',
            accessor: (item) => item.rawMaterialType,
            cellClass: () => 'text-gray-800 uppercase'
        },
        // {
        //     header: 'Inward Date',
        //     accessor: (item) => item.dcDate
        // },
        // {
        //     header: 'Supplier',
        //     accessor: (item) => item.supplier?.name,
        //     cellClass: () => 'uppercase'
        // },
    
     
    ];


  const data = {
    rawMaterialType,
    branchId, id, userId,
    storeId,
    rawMaterialOpeningStockItems: rawMaterialOpeningStockItems.filter(po => po.yarnId || po.fabricId || po.accessoryId), finYearId
  }

  const validateData = (data) => {
    let mandatoryFields = ["uomId", "colorId", "qty", "price"];
    if (rawMaterialType === "GreyYarn" || rawMaterialType === "DyedYarn") {
      mandatoryFields = [...mandatoryFields, ...["yarnId", "noOfBags"]]
    } else if (rawMaterialType === "GreyFabric" || rawMaterialType === "DyedFabric") {
      mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
    } else if (rawMaterialType === "Accessory") {
      mandatoryFields = [...mandatoryFields, ...["accessoryId", "sizeId"]]
    }
    return data.rawMaterialType
      && isGridDatasValid(data.rawMaterialOpeningStockItems, false, mandatoryFields) && data.rawMaterialOpeningStockItems.length !== 0
  }

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        toast.success(text + "Successfully");
        setId("")
        syncFormWithDb(undefined)
      }
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

  const handleView = (id) => {

        setId(id)
        setOpeningStock(true)
        setReadOnly(true);
    };

    const handleEdit = (orderId) => {
        setId(orderId)
        setOpeningStock(true)
        setReadOnly(false);
    };

    const handleDelete = async (orderId) => {
        if (orderId) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                // await removeData(orderId)
                setId("");
                onNew();
                toast.success("Deleted Successfully");
            } catch (error) {
                toast.error("something went wrong");
            }
        }

    };

  const onNew = () => {
    setId("");
    setSearchValue("");
    setReadOnly(false);
    syncFormWithDb(undefined)
    getNextDocId()
  };


  const tableHeadings = ["PoNo", "PoDate", "rawMaterialType", "DueDate", "Supplier"]
  const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']
  useEffect(() => {
    if (id) return
    setRawMaterialOpeningStockItems([]);
  }, [rawMaterialType, id])

  const storeOptions = locationData ?
    locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
    [];

  // if (!branchList || !locationData) return <Loader />

  return (
    // <div
    //   onKeyDown={handleKeyDown}
    //   className="md:items-start md:justify-items-center grid h-full bg-theme overflow-auto">
    //   <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
        
    //     <PurchaseOrderFormReport
    //       heading={MODEL}
    //       tableHeaders={tableHeadings}
    //       tableDataNames={tableDataNames}
    //       loading={
    //         isLoading || isFetching
    //       }
    //       tableWidth="100%"
    //       data={allData?.data}
    //       onClick={(id) => {
    //         setId(id);
    //         setFormReport(false);
    //       }
    //       }
    //       searchValue={searchValue}
    //       setSearchValue={setSearchValue}
    //     />
    //   </Modal>
    //   <Modal isOpen={viewReport} onClose={() => setViewReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
        
    //     <StockReport
    //     storeId={storeId}
    //        options={poTypes}
    //       tableHeaders={tableHeadings}
    //       tableDataNames={tableDataNames}
    //       loading={
    //         isLoading || isFetching
    //       }
    //       tableWidth="100%"
    //       data={allData?.data}
    //       onClick={(id) => {
    //         setId(id);
    //         setFormReport(false);
    //       }
    //       }
    //       searchValue={searchValue}
    //       setSearchValue={setSearchValue}
    //     />
    //   </Modal>
    //   <div className="flex flex-col frame w-full h-full">
    //     <FormHeader
    //       viewReport ={() =>  {setViewReport(true)}}
    //       onNew={onNew}
    //       model={MODEL}
    //       saveData={saveData}
    //       setReadOnly={setReadOnly}
    //       deleteData={deleteData}
    //       openReport={() => { setFormReport(true) }}
    //       childRecord={childRecord.current}
    //     />
    //     <div className="flex-1 grid gap-x-2">
    //       <div className="col-span-3 grid overflow-auto">
    //         <div className='col-span-3 grid overflow-auto'>
    //           <div className='mr-1'>
    //             <div className={`grid`}>
    //               <div className={"flex flex-col"}>
    //                 <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 px-3 overflow-auto'>
    //                   <legend className='sub-heading'>Stock Info</legend>
    //                   <div className='flex flex-col justify-center items-start flex-1 w-full'>
    //                     <div className="grid grid-cols-5 w-full">
    //                       <DisabledInput name="Doc Id." value={docId} required={true}
    //                       />
    //                       <DateInput name="Doc Date" value={date} type={"date"} required={true} readOnly={readOnly} disabled />
    //                       <DropdownInput name="Raw Material Type"
    //                         options={poTypes}
    //                         value={rawMaterialType} setValue={setRawMaterialType} required={true} readOnly={id} />
    //                       <DropdownInput name="Location"
    //                         options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
    //                         value={locationId}
    //                         setValue={(value) => { setLocationId(value); setStoreId("") }}
    //                         required={true} readOnly={id || readOnly} />
    //                       <DropdownInput name="Store"
    //                         options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
    //                         value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />
    //                     </div>
    //                   </div>
    //                 </fieldset>
    //                 <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-600 md:pb-5 flex flex-1 overflow-auto'>
    //                   <legend className='sub-heading'>Stock Details</legend>
    //                   {rawMaterialType.toLowerCase().includes("yarn")
    //                     ?
    //                     <YarnPoItems greyFilter={rawMaterialType.toLowerCase().includes("grey")} id={id} rawMaterialType={rawMaterialType} params={params} poItems={rawMaterialOpeningStockItems} setPoItems={setRawMaterialOpeningStockItems} readOnly={readOnly} />
    //                     :
    //                     (
    //                       rawMaterialType.toLowerCase().includes("fabric")
    //                         ?
    //                         <FabricPoItems greyFilter={rawMaterialType.toLowerCase().includes("grey")} id={id} rawMaterialType={rawMaterialType} params={params} poItems={rawMaterialOpeningStockItems} setPoItems={setRawMaterialOpeningStockItems} readOnly={readOnly} />
    //                         :
    //                         <>
    //                           {(rawMaterialType.toLowerCase() === "accessory")
    //                             ?
    //                             <AccessoryPoItems id={id} rawMaterialType={rawMaterialType} params={params} poItems={rawMaterialOpeningStockItems} setPoItems={setRawMaterialOpeningStockItems} readOnly={readOnly} />
    //                             :
    //                             <></>
    //                           }
    //                         </>
    //                     )
    //                   }
    //                 </fieldset>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  <>
            {showOpeningStock ? (
                <OpeningStockForm
                    onClose={() => { setOpeningStock(false); setReadOnly(prev => !prev) }}  id={id}  setId={setId}
                //  orderDetails={orderDetails} setOrderDetails={setOrderDetails} readOnly={readOnly} setReadOnly={setReadOnly} id={id} setId={setId} onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }}
                    // partyData={partyData?.data} 
                />
            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <h1 className="text-2xl font-bold text-gray-800">Opening Stock</h1>
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-1.5 border rounded-md text-sm"
                            >
                                <option value="this-month">This Month</option>
                                <option value="last-month">Last Month</option>
                            </select>
                            <select
                                value={selectedFinYear}
                                onChange={(e) => setSelectedFinYear(e.target.value)}
                                className="px-3 py-1.5 border rounded-md text-sm"
                            >
                                <option value="2023-2024">2023-2024</option>
                                <option value="2022-2023">2022-2023</option>
                            </select>

                        </div>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1.5 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setOpeningStock(true); onNew() }}
                        >
                             <FaPlus /> 
                            Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <CommonTable
                            columns={columns}
                            data={allData?.data || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            itemsPerPage={10}
                        />
                                            </div>
                </div>
            )}
        </>
  );
}
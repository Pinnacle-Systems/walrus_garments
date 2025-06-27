import React, { useEffect, useState, useRef, useCallback } from "react";
import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
// import { useGetTaxTemplateQuery } from '../../../redux/ErpServices/TaxTemplateServices';
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { LongDropdownInput, DisabledInput, DropdownInput, DateInput, TextInput } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';
// import { poTypes, } from '../../../Utils/DropdownData';
import YarnPoItems from "./YarnPoItems";
import FabricPoItems from "./FabricPoItems";
import AccessoryPoItems from "./AccessoryPoItems"
import Consolidation from "../Consolidation";
import PoItemsSelection from "./PoItemsSelection";
import AccessoryInwardItems from "./AccessoryInwardItems";
import FabricInwardItems from "./FabricInwardItems";
import moment from "moment";
// import PoSummary from "./PoSummary";
import Modal from "../../../UiComponents/Modal";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import PurchaseOrderFormReport from "./PurchaseOrderFormReport";
import {
  useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import { Loader } from '../../../Basic/components';
import {
  useAddDirectCancelOrReturnMutation, useDeleteDirectCancelOrReturnMutation,
  useGetDirectCancelOrReturnByIdQuery, useGetDirectCancelOrReturnQuery, useUpdateDirectCancelOrReturnMutation
}
  from "../../../redux/uniformService/DirectCancelOrReturnServices";
import { getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
import { directOrPo, directOrPoreturn, poTypes } from "../../../Utils/DropdownData";
import InwardItemsSelection from "./InwardItemsSelection";
import FabricDirectInwardItems from "./FabricDirectInwardItems";
import AccessoryDirectInwardItems from "./AccessoryDirectInwardItems";
import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "../PurchaseReturnCancel/PrintFormat-PR/index";
import tw from "../../../Utils/tailwind-react-pdf";
import PurchaseReturnForm from "./PurchaseReturnForm";
import CommonTable from "../../../Shocks/CommonReport/CommonTable";
import { FaPlus } from "react-icons/fa";

const MODEL = "Purchase Return / Direct Return";


export default function Form() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showManufacturer, setShowManufacturer] = useState(false);
  const [id, setId] = useState("");
  const { branchId, userId, companyId, finYearId } = getCommonParams();
  const [readOnly, setReadOnly] = useState(false);
  const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectReturn");
  const params = {
    branchId, userId, finYearId
  };
  const [directInwardReturnItems, setDirectInwardReturnItems] = useState([]);
  const { data: allData, isLoading, isFetching } = useGetDirectCancelOrReturnQuery({ params: { branchId, poInwardOrDirectInward, finYearId } });
  const { data: partyData } = useGetPartyQuery({ params })
  const [removeData] = useDeleteDirectCancelOrReturnMutation();
  const columns = [
    {
      header: 'S.No',
      accessor: (item, index) => index + 1,
      cellClass: () => 'font-medium text-gray-900'
    },
    {
      header: 'Order No.',
      accessor: (item) => item.docId,
      cellClass: () => 'font-medium text-gray-900'
    },
    {
      header: 'Order Date',
      accessor: (item) => item.docDate
    },
    {
      header: 'Party',
      accessor: (item) => item.Party?.name,
      cellClass: () => 'uppercase'
    },
    {
      header: 'ContactPerson',
      accessor: (item) => item.contactPersonName,
      cellClass: () => 'text-gray-800 uppercase'
    },
    {
      header: 'Contact',
      accessor: (item) => item.phone,
      cellClass: () => 'text-gray-800 uppercase'
    },
  ];



  const handleView = (orderId) => {

    setId(orderId)
    setShowManufacturer(true)
    setReadOnly(true);
  };

  const handleEdit = (orderId) => {
    setId(orderId)
    setShowManufacturer(true)
    setReadOnly(false);
  };

  const handleDelete = async (orderId) => {
    if (orderId) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(orderId)
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
    setReadOnly(false);
    setDirectInwardReturnItems([]);

  }


  return (
    <>
      {showManufacturer ? (
        <PurchaseReturnForm isLoading={isLoading} isFetching={isFetching} poInwardOrDirectInward={poInwardOrDirectInward} setPoInwardOrDirectInward={setPoInwardOrDirectInward} id={id} setId={setId} allData={allData} directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems}
          onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }}
        />

      ) : (
        <div className="p-2 bg-[#F1F1F0] min-h-screen">
          <h1 className="text-2xl font-bold text-gray-800">Purchase Return</h1>
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
              onClick={() => { setShowManufacturer(true); onNew() }}
            >
              <FaPlus /> Create New
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





























  // return (
  //   <div
  //     onKeyDown={handleKeyDown}
  //     className="md:items-start md:justify-items-center grid h-full bg-theme overflow-auto">
  //     <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
  //       <PurchaseOrderFormReport
  //         heading={MODEL}
  //         tableHeaders={tableHeadings}
  //         tableDataNames={tableDataNames}
  //         loading={
  //           isLoading || isFetching
  //         }
  //         tableWidth="100%"
  //         data={allData?.data}
  //         onClick={(id) => {
  //           setId(id);
  //           setFormReport(false);
  //         }
  //         }
  //         searchValue={searchValue}
  //         setSearchValue={setSearchValue}
  //       />
  //     </Modal>
  //     <Modal
  //       isOpen={printModal}
  //       onClose={() => setPrintModal(false)}
  //       widthClass={"w-[90%] h-[90%]"}
  //     >
  //       <PDFViewer style={tw("w-full h-full")}>
  //         <PrintFormat
  //           data={id ? singleData?.data : "Null"}
  //           singleData={id ? singleData?.data : "Null"}
  //           date={id ? singleData?.data?.selectedDate : date}
  //           docId={docId ? docId : ""}

  //         />
  //       </PDFViewer>

  //     </Modal>


  //     <Modal isOpen={inwardItemSelection} onClose={() => setInwardItemSelection(false)} widthClass={"w-[95%] h-[90%] py-10"}>

  //       {
  //         (poInwardOrDirectInward == "PurchaseReturn") ?
  //           <PoItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
  //             supplierId={supplierId}
  //             inwardItems={directInwardReturnItems}
  //             setInwardItems={setDirectInwardReturnItems}
  //             storeId={storeId} />
  //           :
  //           <InwardItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
  //             supplierId={supplierId}
  //             storeId={storeId}
  //             inwardItems={directInwardReturnItems}
  //             setInwardItems={setDirectInwardReturnItems} />
  //       }

  //     </Modal>



  //     <div className="flex flex-col frame w-full h-full">
  //       <FormHeader
  //         onNew={onNew}
  //         model={MODEL}
  //         saveData={saveData}
  //         setReadOnly={setReadOnly}
  //         deleteData={deleteData}
  //         openReport={() => { setFormReport(true) }}
  //         onPrint={id ? () => setPrintModal(true) : null}
  //         childRecord={childRecord.current}
  //       />
  //       <div className="flex-1 grid gap-x-2">
  //         <div className="col-span-3 grid overflow-auto">
  //           <div className='col-span-3 grid overflow-auto'>
  //             <div className='mr-1'>
  //               <div className={`grid`}>
  //                 <div className={"flex flex-col"}>
  //                   <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 h-[160px] px-3 overflow-auto'>
  //                     <legend className='sub-heading'>Return Info</legend>
  //                     <div className='flex flex-col justify-center items-start flex-1 w-full'>
  //                       <div className="grid grid-cols-5 w-full">
  //                         <DisabledInput name="Doc. Id." value={docId} required={true}
  //                         />
  //                         <DateInput name="Doc Date" value={date} type={"date"} required={true} readOnly={readOnly} disabled />
  //                         <DropdownInput name="Inward Type"
  //                           beforeChange={() => { setDirectInwardReturnItems([]) }}
  //                           options={directOrPoreturn}
  //                           value={poInwardOrDirectInward} setValue={setPoInwardOrDirectInward} required={true} readOnly={readOnly} />
  //                         <DropdownInput name="Po Type"

  //                           options={poTypes}
  //                           value={transType}
  //                           setValue={setTransType}
  //                           required={true}
  //                           readOnly={readOnly} />

  //                         <DropdownInput name="Supplier" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={supplierId} setValue={setSupplierId} required={true} readOnly={id} />

  //                         <TextInput name={"Dc No."} value={dcNo} setValue={setDcNo} readOnly={readOnly} required />
  //                         <DateInput name="Dc Date" value={dcDate} setValue={setDcDate} required={true} readOnly={readOnly} />
  //                         {/* <DropdownInput name="Pay Terms" options={dropDownListObject(payTermList ? payTermList.data : [], "name", "id")} value={payTermId} setValue={(value) => { setPayTermId(value); }} required={true} readOnly={readOnly} /> */}
  //                         {/* <DropdownInput name="Tax Type" options={dropDownListObject(taxTypeList ? taxTypeList.data : [], "name", "id")} value={taxTemplateId} setValue={setTaxTemplateId} required={true} readOnly={readOnly} /> */}
  //                         <DropdownInput name="Location"
  //                           options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
  //                           value={locationId}
  //                           setValue={(value) => { setLocationId(value); setStoreId("") }}
  //                           required={true} readOnly={id || readOnly} />
  //                         <DropdownInput name="Store"
  //                           options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
  //                           value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />




  //                         {(!readOnly && (poInwardOrDirectInward == "PurchaseReturn") || (poInwardOrDirectInward == "DirectReturn")) &&
  //                           < div className="">
  //                             <button className="p-1.5 mt-2 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white"
  //                               onClick={() => {
  //                                 if (!supplierId || !transType || !storeId) {
  //                                   toast.info("Please Select Suppplier and Store", { position: "top-center" })
  //                                   return
  //                                 }
  //                                 setInwardItemSelection(true)
  //                               }}
  //                             >Select Items</button>
  //                           </div>
  //                         }
  //                       </div>
  //                     </div>
  //                   </fieldset>
  //                   <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 border border-gray-600 md:pb-5 flex 
  //                   h-[330px] w-full overflow-auto'>
  //                     <legend className='sub-heading'>Return Details</legend>
  //                     {

  //                       poInwardOrDirectInward == "DirectReturn" &&

  //                       (
  //                         transType.toLowerCase().includes("fabric")
  //                           ?
  //                           <FabricDirectInwardItems storeId={storeId} removeItem={removeItem} transType={transType} purchaseInwardId={id} params={params}
  //                             inwardItems={directInwardReturnItems} setInwardItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
  //                           :
  //                           <AccessoryDirectInwardItems storeId={storeId} params={params} purchaseInwardId={id} removeItem={removeItem} transType={transType} inwardItems={directInwardReturnItems} setInwardItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
  //                       )

  //                     }

  //                     {

  //                       poInwardOrDirectInward == "PurchaseReturn" &&
  //                       (
  //                         transType.toLowerCase().includes("fabric")
  //                           ?
  //                           <FabricInwardItems storeId={storeId} removeItem={removeItem} transType={transType} purchaseInwardId={id} params={params}
  //                             inwardItems={directInwardReturnItems} setInwardItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
  //                           :
  //                           <AccessoryInwardItems storeId={storeId} params={params} purchaseInwardId={id} removeItem={removeItem} transType={transType} inwardItems={directInwardReturnItems}
  //                             setInwardItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
  //                       )

  //                     }
  //                   </fieldset>

  //                   <Consolidation readOnly={readOnly} totalQty={getTotalIssuedQty()} vehicleNo={vehicleNo} setVehicleNo={setVehicleNo} remarks={remarks} setRemarks={setRemarks}
  //                     specialInstructions={specialInstructions} setSpecialInstructions={setSpecialInstructions} />


  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div >
  //   </div >
  // );
}
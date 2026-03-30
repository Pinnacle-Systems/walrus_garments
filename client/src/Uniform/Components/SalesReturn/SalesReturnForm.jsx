import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
import { ReusableInput } from "../Order/CommonInput";
import { DateInput, DropdownInput, ReusableSearchableInput, TextAreaNew, TextInput } from "../../../Inputs";
import { directOrPo } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import CommonFormFooter from "../ReusableComponents/CommonFormFooter";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import { useAddDirectInwardOrReturnMutation, useGetDirectInwardOrReturnByIdQuery, useUpdateDirectInwardOrReturnMutation } from "../../../redux/uniformService/DirectInwardOrReturnServices";
import moment from "moment";
import Swal from "sweetalert2";
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import { useAddSalesDeliveryMutation, useGetSalesDeliveryByIdQuery, useGetSalesDeliveryQuery, useUpdateSalesDeliveryMutation } from "../../../redux/uniformService/salesDeliveryServices";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import PremiumSalesPrintFormat from "../ReusableComponents/PremiumSalesPrintFormat";
import ThermalSalesPrintFormat from "../ReusableComponents/ThermalSalesPrintFormat";
import SalesReturnItems from "./SalesReturnItems";
import { useAddSalesReturnMutation, useGetSalesReturnByIdQuery, useGetSalesReturnQuery, useUpdateSalesReturnMutation } from "../../../redux/uniformService/salesReturnServices";
import TransactionEntryShell from "../ReusableComponents/TransactionEntryShell";
import TransactionHeaderSection from "../ReusableComponents/TransactionHeaderSection";



const SalesReturnForm = ({ onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate, customerId, setCustomerId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, poInwardOrDirectInward, setPoInwardOrDirectInward, inwardItemSelection, setInwardItemSelection, onNew, branchList, locationData, supplierList, setDeliveryItems, deliveryItems,
  yarnList, colorList, uomList, hsnList, setSalesDeliveryId, salesDeliveryId


}) => {








  const [vehicleNo, setVehicleNo] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [remarks, setRemarks] = useState("")
  const [terms, setTerms] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [discountType, setDiscountType] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [contextMenu, setContextMenu] = useState(false)
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [thermalPrintOpen, setThermalPrintOpen] = useState(false);
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);



  const childRecord = useRef(0);
  const { branchId, companyId, userId, finYearId } = getCommonParams()

  const branchIdFromApi = useRef(branchId);

  const params = {
    branchId, companyId, userId, finYearId
  };



  const { data: salesDeliveryData } =
    useGetSalesDeliveryQuery({ params: { ...params } });

  const { data: singleSalesDeliveryData } =
    useGetSalesDeliveryByIdQuery(salesDeliveryId, { skip: !salesDeliveryId });


  const { data: supplierDetails } =
    useGetPartyByIdQuery(customerId, { skip: !customerId });

  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSalesReturnByIdQuery(id, { skip: !id });

  const [addData] = useAddSalesReturnMutation();
  const [updateData] = useUpdateSalesReturnMutation();




  const inwardTyperef = useRef(null);


  useEffect(() => {
    if (inwardTyperef.current && !id) {
      inwardTyperef.current.focus();
    }
  }, []);


  const syncFormWithDb = useCallback((data) => {
    console.log(data?.DirectItems, "data?.DirectItems")
    const today = new Date()
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    setTransType(data?.poType ? data.poType : "DyedYarn");
    setPoInwardOrDirectInward(data?.poInwardOrDirectInward ? data?.poInwardOrDirectInward : "DirectInward")
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setDeliveryItems(data?.SalesDeliveryItems ? data.SalesDeliveryItems : []);
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
    // setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
    setPayTermId(data?.payTermId ? data?.payTermId : "");
    setCustomerId(data?.customerId ? data?.customerId : "");
    setDcDate(data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setDcNo(data?.dcNo ? data.dcNo : "")
    setLocationId(data?.branchId ? data?.branchId : "")
    setStoreId(data?.storeId ? data.storeId : "")
    setVehicleNo(data?.vehicleNo ? data?.vehicleNo : "")
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setRemarks(data?.remarks ? data?.remarks : "")
    setTerms(data?.terms ? data?.terms : "")
    if (data?.branchId) {
      branchIdFromApi.current = data?.branchId
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    docId,
    poType: transType,
    poInwardOrDirectInward,
    supplierId: customerId, dcDate,
    payTermId,
    id, userId,
    storeId,
    deliveryItems: deliveryItems?.filter(i => i.itemId),
    discountType,
    discountValue,
    dcNo,
    remarks,
    specialInstructions,
    vehicleNo,
    finYearId,
    locationId: locationId ? parseInt(locationId) : undefined,
    branchId,
    customerId,
    terms

  }

  console.log(data, "data")






  // const validateData = (data) => {
  //   let mandatoryFields = ["uomId", "colorId", "price"];
  //   let lotMandatoryFields = ["qty"]
  //   if (transType === "GreyYarn" || transType === "DyedYarn") {
  //     mandatoryFields = [...mandatoryFields, "yarnId"]
  //     lotMandatoryFields = [...lotMandatoryFields, "noOfBags", "weightPerBag"]
  //   } else if (transType === "GreyFabric" || transType === "DyedFabric") {
  //     mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
  //     lotMandatoryFields = [...lotMandatoryFields, "noOfRolls"]
  //   } else if (transType === "Accessory") {
  //     mandatoryFields = [...mandatoryFields, ...["accessoryId"]]
  //   }




  //   return data.poType && data.supplierId && data.dcDate && data.payTermId && data.dcNo
  //     &&
  //     (
  //       (data.poType === "Accessory")
  //         ?
  //         isGridDatasValid(data.directInwardReturnItems, false, [...mandatoryFields, "qty"])
  //         :
  //         data.directInwardReturnItems.every(item => item?.inwardLotDetails && isGridDatasValid(item?.inwardLotDetails, false, lotMandatoryFields))
  //     )
  //     && isGridDatasValid(data.directInwardReturnItems, false, mandatoryFields)
  //     && data.directInwardReturnItems.length !== 0






  const validateData = (data) => {

    if (data?.customerId) {
      return true
    }

    return false
  }
  console.log(data, "data")







  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
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
        Swal.fire({
          icon: 'success',
          title: `${text || 'Saved'} Successfully`,
          showConfirmButton: false,
          timer: 2000
        });

        if (returnData.statusCode === 0) {
          if (nextProcess == "new") {
            syncFormWithDb(undefined);
            onNew()
          }
          else if (nextProcess == "close") {
            onClose()
          }
          else {
            setId(returnData?.data?.id);

          }




        } else {
          toast.error(returnData?.message);
        }

      }
    } catch (error) {
      console.log("handle");
    }
  };

  function removeItem(id) {
    setDeliveryItems(directInwardItems => {
      let newItems = structuredClone(directInwardItems);
      newItems = newItems.filter(item => parseInt(item.poItemsId) !== parseInt(id))
      return newItems
    });
  }






  const saveData = (nextProcess) => {

    let mandatoryFields = ["itemId", "sizeId", "colorId", "uomId", "qty", "price"];

    if (!validateData(data)) {


      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "success",

      });
      return
    }
    if (!isGridDatasValid((data?.deliveryItems)?.filter(i => i.itemId), false, mandatoryFields)) {
      Swal.fire({
        title: "Please fill all Delivery Items Mandatory fields...!",
        icon: "warning",
      });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return
    }
    if (nextProcess == "draft" && !id) {
      handleSubmitCustom(addData, data = { ...data, draftSave: true }, "Added", nextProcess);
    }


    else if (id && nextProcess == "draft") {

      handleSubmitCustom(updateData, data = { ...data, draftSave: true }, "Updated", nextProcess);
    }
    else if (id) {

      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  }

  function getTotalQty() {
    let qty = deliveryItems?.reduce((acc, curr) => { return acc + parseFloat(curr?.qty ? curr?.qty : 0) }, 0)
    return parseFloat(qty || 0).toFixed(3)
  }

  const calculateTotals = () => {
    return deliveryItems?.reduce((acc, curr) => {
      const price = parseFloat(curr.price || 0);
      const qty = parseFloat(curr.qty || 0);
      const taxPercent = parseFloat(curr.tax || 0);
      const subtotal = price * qty;
      const taxAmount = (subtotal * taxPercent) / 100;

      acc.subtotal += subtotal;
      acc.taxAmount += taxAmount;
      acc.netAmount += (subtotal + taxAmount);
      return acc;
    }, { subtotal: 0, taxAmount: 0, netAmount: 0 }) || { subtotal: 0, taxAmount: 0, netAmount: 0 };
  }

  const { subtotal, taxAmount, netAmount } = calculateTotals();
  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
    }
    return false
  }

  const handleRightClick = (event, rowIndex, type) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const summaryItems = [
    { label: "No", value: docId },
    { label: "Date", value: date },
    {
      label: "Customer",
      value:
        supplierDetails?.data?.name ||
        findFromList(customerId, supplierList?.data, "name") ||
        findFromList(customerId, supplierList?.data, "aliasName"),
    },
    {
      label: "Phone",
      value:
        supplierDetails?.data?.contactPersonNumber ||
        findFromList(customerId, supplierList?.data, "contactPersonNumber"),
    },
    {
      label: "Address",
      value:
        supplierDetails?.data?.address ||
        findFromList(customerId, supplierList?.data, "address"),
    },
    {
      label: "Delivery",
      value: findFromList(salesDeliveryId, salesDeliveryData?.data, "docId"),
    },
  ];

  const footerContent = (
    <CommonFormFooter
      remarks={remarks}
      setRemarks={setRemarks}
      terms={terms}
      setTerms={setTerms}
      readOnly={readOnly}
      totalsRows={[
        {
          key: "totalQty",
          label: "Total Quantity",
          value: getTotalQty() || 0,
        },
        {
          key: "subtotal",
          label: "Subtotal",
          value: `₹${(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        },
        {
          key: "taxAmount",
          label: "GST Amount",
          value: `₹${(taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        },
        {
          key: "netAmount",
          label: "Net Amount",
          value: `₹${(netAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          emphasized: true,
        },
      ]}
      leftActions={
        <>
          <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
            <FiSave className="w-4 h-4 mr-2" />
            Save & New
          </button>
          <button onClick={() => saveData("close")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
            <HiOutlineRefresh className="w-4 h-4 mr-2" />
            Save & Close
          </button>
        </>
      }
      rightActions={
        <>
          <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
            onClick={() => setReadOnly(false)}
          >
            <FiEdit2 className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
            onClick={() => {
              if (!deliveryItems?.filter(i => i.itemId).length) {
                toast.warning("Please add some items first");
                return;
              }
              setPrintOpen(true);
            }}
          >
            <FiPrinter className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            className="bg-orange-600 text-white px-4 py-1 rounded-md hover:bg-orange-700 flex items-center text-sm ml-2"
            onClick={() => {
              if (!deliveryItems?.filter(i => i.itemId).length) {
                toast.warning("Please add some items first");
                return;
              }
              setThermalPrintOpen(true);
            }}
          >
            <FiPrinter className="w-4 h-4 mr-2" />
            Thermal Print
          </button>
        </>
      }
    />
  );


  return (
    <>
      <Modal isOpen={printOpen} onClose={() => setPrintOpen(false)} widthClass="w-[95%] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <PremiumSalesPrintFormat
            title="DELIVERY CHALLAN"
            docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={deliveryItems?.filter(i => i.itemId)}
            remarks={remarks}
            itemList={itemList?.data}
            sizeList={sizeList?.data}
            colorList={colorList?.data}
            uomList={uomList?.data}
            hsnList={hsnList?.data}
          />
        </PDFViewer>
      </Modal>

      <Modal isOpen={thermalPrintOpen} onClose={() => setThermalPrintOpen(false)} widthClass="w-[300pt] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <ThermalSalesPrintFormat
            title="DELIVERY CHALLAN"
            docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={deliveryItems?.filter(i => i.itemId)}
            remarks={remarks}
            itemList={itemList?.data}
            sizeList={sizeList?.data}
            colorList={colorList?.data}
            uomList={uomList?.data}
            hsnList={hsnList?.data}
          />
        </PDFViewer>
      </Modal>

      <TransactionEntryShell
        title="Sales Return"
        onClose={onClose}
        headerOpen={isHeaderOpen}
        setHeaderOpen={setIsHeaderOpen}
        summaryItems={summaryItems}
        openStateClassName="max-h-[420px] opacity-100 overflow-visible"
        headerBodyClassName="px-2 pb-2 overflow-visible"
        footer={footerContent}
        headerContent={(
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

          <TransactionHeaderSection title="Basic Details" className="col-span-1" bodyClassName="grid-cols-2">
              <ReusableInput label="Sales Return No" readOnly value={docId} />
              <ReusableInput label="Sales Return Date" value={date} type={"date"} required={true} readOnly={true} disabled />
          </TransactionHeaderSection>

          <TransactionHeaderSection title="Customer Details" className="col-span-2 overflow-visible" bodyClassName="grid-cols-7 gap-1 overflow-visible">

              <div className="col-span-3 overflow-visible">


                <ReusableSearchableInput
                  label="Customer Name"
                  component="PartyMaster"
                  placeholder="Search Customer Name..."
                  optionList={supplierList?.data}
                  setSearchTerm={(value) => { setCustomerId(value) }}
                  searchTerm={customerId}
                  show={"isClient"}
                  required={true}
                  disabled={id}
                />
              </div>
              <TextInput
                name={"Phone Number"}
                value={
                  supplierDetails?.data?.contactPersonNumber ||
                  findFromList(customerId, supplierList?.data, "contactPersonNumber")
                }
                disabled={true}
                required
              />
              <div className="col-span-3">
                <TextAreaNew
                  name="Address"
                  placeholder="Address"
                  value={
                    supplierDetails?.data?.address ||
                    findFromList(customerId, supplierList?.data, "address")
                  }
                  disabled
                />
              </div>
            <div className="col-span-4">
            <DropdownInput name="Sales Order No"
              options={dropDownListObject(id ? salesDeliveryData?.data : salesDeliveryData?.data?.filter(i => i.customerId == customerId), "docId", "id")}
              value={salesDeliveryId} setValue={setSalesDeliveryId} required={true} readOnly={id || readOnly} />
            </div>
          </TransactionHeaderSection>



          </div>
        )}
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          <fieldset className="h-full min-h-0">
            <SalesReturnItems
              deliveryItems={deliveryItems} setDeliveryItems={setDeliveryItems} setInwardItemSelection={setInwardItemSelection} supplierId={customerId} handleRightClick={handleRightClick} contextMenu={contextMenu}
              handleCloseContextMenu={handleCloseContextMenu} yarnList={yarnList} colorList={colorList} uomList={uomList}
              itemList={itemList} sizeList={sizeList}
            />
          </fieldset>
        </div>
      </TransactionEntryShell>
    </>
  );
}

export default SalesReturnForm;

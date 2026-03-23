import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
import { FaFileAlt } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DateInput, DropdownInput, ReusableSearchableInput, TextInput } from "../../../Inputs";
import { directOrPo } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
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
import SaleOrderItems from "./SaleOrderItems";
import { useAddsaleOrderMutation, useGetsaleOrderByIdQuery, useUpdatesaleOrderMutation } from "../../../redux/uniformService/saleOrderServices";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import PremiumSalesPrintFormat from "../ReusableComponents/PremiumSalesPrintFormat";
import ThermalSalesPrintFormat from "../ReusableComponents/ThermalSalesPrintFormat";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import CommonFormFooter from "../ReusableComponents/CommonFormFooter";



const SaleOrderForm = ({ onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate, customerId, setCustomerId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, poInwardOrDirectInward, setPoInwardOrDirectInward, inwardItemSelection, setInwardItemSelection, onNew, branchList, locationData, supplierList, setSaleOrderItems, saleOrderItems,
  yarnList, colorList, uomList, convertQuotationId


}) => {








  const [vehicleNo, setVehicleNo] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [remarks, setRemarks] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [discountType, setDiscountType] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [terms, setTerms] = useState("")
  const [contextMenu, setContextMenu] = useState(false)
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [thermalPrintOpen, setThermalPrintOpen] = useState(false);

  const [suppliers, setSuppliers] = useState([
    "Supplier One",
    "Supplier Two",
    "Supplier Three",
  ]);

  const childRecord = useRef(0);
  const { branchId, companyId, userId, finYearId } = getCommonParams()

  const branchIdFromApi = useRef(branchId);

  const params = {
    branchId, companyId, userId, finYearId
  };






  const { data: supplierDetails } =
    useGetPartyByIdQuery(customerId, { skip: !customerId });

  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: hsnList } = useGetHsnMasterQuery({ params });


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetsaleOrderByIdQuery(id, { skip: !id });

  const [addData] = useAddsaleOrderMutation();
  const [updateData] = useUpdatesaleOrderMutation();




  const inwardTyperef = useRef(null);


  useEffect(() => {
    if (inwardTyperef.current && !id) {
      inwardTyperef.current.focus();
    }
  }, []);


  const syncFormWithDb = useCallback((data) => {
    const today = new Date()
    console.log(convertQuotationId, "convertQuotationId")
    if (convertQuotationId || !id) return
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setSaleOrderItems(data?.SaleOrderItems ? data.SaleOrderItems : []);
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
    setRemarks(data?.remarks || "");
    setTerms(data?.terms || "");

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
    saleOrderItems: saleOrderItems?.filter(i => i.itemId),
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
    convertQuotationId,
    terms
  }

  console.log(data, "data")









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
          } else {
            onClose()
          }

          if (convertQuotationId) {
            convertQuotationId = null
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
    setQuoteItems(directInwardItems => {
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
    if (!isGridDatasValid((data?.saleOrderItems)?.filter(i => i.itemId), false, mandatoryFields)) {
      Swal.fire({
        title: "Please fill all Sale Order Items Mandatory fields...!",
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
    let qty = saleOrderItems?.reduce((acc, curr) => { return acc + parseFloat(curr?.qty ? curr?.qty : 0) }, 0)
    return parseFloat(qty || 0).toFixed(3)
  }

  const calculateTotals = () => {
    return saleOrderItems?.reduce((acc, curr) => {
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


  return (
    <>
      <Modal isOpen={printOpen} onClose={() => setPrintOpen(false)} widthClass="w-[95%] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <PremiumSalesPrintFormat
            title="SALE ORDER"
            docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={saleOrderItems?.filter(i => i.itemId)}
            remarks={remarks}
            itemList={itemList?.data}
            sizeList={sizeList?.data}
            colorList={colorList?.data}
            uomList={uomList?.data}
          />
        </PDFViewer>
      </Modal>

      <Modal isOpen={thermalPrintOpen} onClose={() => setThermalPrintOpen(false)} widthClass="w-[300pt] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <ThermalSalesPrintFormat
            title="SALE ORDER"
            docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={saleOrderItems?.filter(i => i.itemId)}
            remarks={remarks}
            itemList={itemList?.data}
            sizeList={sizeList?.data}
            colorList={colorList?.data}
            uomList={uomList?.data}
            hsnList={hsnList?.data}
          />
        </PDFViewer>
      </Modal>

      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Sale Order</h1>
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>

      </div>
      <div className="space-y-3 h-full mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Basic Details
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput label="Sale Order No" readOnly value={docId} />
              <ReusableInput label="Sale Order Date" value={date} type={"date"} required={true} readOnly={true} disabled />


            </div>
          </div>




          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">
            <h2 className="font-medium text-slate-700 mb-2">
              Customer Details
            </h2>
            <div className="grid grid-cols-4 gap-1">

              <div className="col-span-2">


                <ReusableSearchableInput
                  label="Customer Id"
                  component="PartyMaster"
                  placeholder="Search Customer Id..."
                  optionList={supplierList?.data}
                  setSearchTerm={(value) => { setCustomerId(value) }}
                  searchTerm={customerId}
                  show={"isClient"}
                  required={true}
                  disabled={id}
                />
              </div>
              <TextInput name={"Phone Number"} value={findFromList(customerId, supplierList?.data, "contactPersonNumber")} disabled={true} required />
            </div>

          </div>



        </div>
        <fieldset>
          <SaleOrderItems
            saleOrderItems={saleOrderItems} setSaleOrderItems={setSaleOrderItems} setInwardItemSelection={setInwardItemSelection} supplierId={customerId} handleRightClick={handleRightClick} contextMenu={contextMenu}
            handleCloseContextMenu={handleCloseContextMenu} yarnList={yarnList} colorList={colorList} uomList={uomList}
            itemList={itemList} sizeList={sizeList}
          />
        </fieldset>

        <CommonFormFooter
          remarks={remarks}
          setRemarks={setRemarks}
          terms={terms}
          setTerms={setTerms}
          totalQty={getTotalQty()}
          subtotal={subtotal}
          taxAmount={taxAmount}
          netAmount={netAmount}
        />



        <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <FiSave className="w-4 h-4 mr-2" />
              Save & New
            </button>
            <button onClick={() => saveData("close")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <HiOutlineRefresh className="w-4 h-4 mr-2" />
              Save & Close
            </button>

          </div>

          <div className="flex gap-2 flex-wrap">

            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
              onClick={() => setReadOnly(false)}
            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit
            </button>

            <button
              className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
              onClick={() => {
                if (!saleOrderItems?.filter(i => i.itemId).length) {
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
                if (!saleOrderItems?.filter(i => i.itemId).length) {
                  toast.warning("Please add some items first");
                  return;
                }
                setThermalPrintOpen(true);
              }}
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Thermal Print
            </button>
          </div>
        </div>

      </div>


    </>
  );
}

export default SaleOrderForm;
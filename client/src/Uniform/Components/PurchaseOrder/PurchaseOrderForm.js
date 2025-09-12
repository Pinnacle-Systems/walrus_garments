import { FaFileAlt } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DateInputNew, DropdownInput, DropdownWithSearch, Modal, ReusableSearchableInput } from "../../../Inputs";
import { poTypes, purchaseType, stockTransferType } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import { getCommonParams } from "../../../Utils/helper";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import YarnPoItems from "./YarnPoItems";
import AccessoryPoItems from "./AccessoryPoItems";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa6";
import { useAddPoMutation, useDeletePoMutation, useGetPoByIdQuery, useUpdatePoMutation } from "../../../redux/uniformService/PoServices";
import { useGetOrderByIdQuery, useGetOrderItemsByIdNewQuery, useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import Swal from "sweetalert2";
import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "./PrintFormat-PO";
import tw from "../../../Utils/tailwind-react-pdf";
import OrderPurchase from "./OrderPurchase";
import { useGetRequirementPlanningFormByIdQuery, useGetRequirementPlanningFormQuery } from "../../../redux/uniformService/RequirementPlanningFormServices";

const PurchaseOrderForm = ({ onClose, id, setId, readOnly, setReadOnly, allData }) => {




  const today = new Date()
  const componentRef = useRef();

  const [poItems, setPoItems] = useState([]);
  const [docId, setDocId] = useState("")
  const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [transType, setTransType] = useState("GreyYarn");
  const [supplierId, setSupplierId] = useState("");

  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [partyId, setPartyId] = useState(false);
  const [orderId, setOrderId] = useState("")
  const [remarks, setRemarks] = useState("")
  const [PurchaseType, setPurchaseType] = useState('General Purchase')


  const [deliveryType, setDeliveryType] = useState("")
  const [deliveryToId, setDeliveryToId] = useState("")
  const [showExtraCharge, setShowExtraCharge] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [orderSizeDetails, setOrderSizeDetails] = useState([])
  const [orderYarnDetails, setOrderYarnDetails] = useState([])

  const [requirementId, setRequirementId] = useState("");
  const [suppliers, setSuppliers] = useState([
    "Supplier One",
    "Supplier Two",
    "Supplier Three",
  ]);

  const { branchId, userId, companyId, finYearId } = getCommonParams();
  const params = {
    branchId, userId, finYearId
  };
  const { data: orderData } = useGetOrderQuery({ params });

  const {
    data: singleOrderData,
    isFetching: isSingleOrderFetching,
    isLoading: isSingleOrderLoading,
  } = useGetOrderItemsByIdNewQuery({id : orderId}, { skip: !orderId });


  const getNextDocId = useCallback(() => {
    //   if (id || isLoading || isFetching) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, id])

  useEffect(getNextDocId, [getNextDocId])

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPoByIdQuery(id, { skip: !id });

  const [addData] = useAddPoMutation();
  const [updateData] = useUpdatePoMutation();
  const [removeData] = useDeletePoMutation();



  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });

  const allSuppliers = supplierList ? supplierList?.data?.filter(S => S.isSupplier) : []






  const handleAddSupplier = (newName) => {
    if (!suppliers.includes(newName)) {
      setSuppliers([...suppliers, newName]);
    }
  };






  function getTotalQty() {
    let qty = poItems?.reduce((acc, curr) => { return acc + parseInt(curr?.qty ? curr?.qty : 0) }, 0)
    return parseInt(qty)
  }

 



  const syncFormWithDb = useCallback((data) => {


    setReadOnly(true)


    setTransType(data?.transType);
    setDate(data?.createdAt
      ? moment.utc(data.createdAt).format("YYYY-MM-DD")
      : moment.utc(new Date()).format("YYYY-MM-DD")
    );

    setPoItems(data?.PoItems || []);
    setDocId(data?.docId || "");
    setPartyId(data?.partyId || "");
    setPayTermId(data?.payTermId || "");
    setDiscountType(data?.discountType || "Percentage");
    setDiscountValue(data?.discountValue || "0");
    setSupplierId(data?.supplierId || "");
    setDueDate(data?.dueDate
      ? moment.utc(data.dueDate).format("YYYY-MM-DD")
      : ""
    );
    setDeliveryType(data?.deliveryType || "");
    setDeliveryToId(
      data?.deliveryType === "ToSelf"
        ? data?.deliveryBranchId
        : data?.deliveryPartyId || ""
    );
    setRemarks(data?.remarks || "");
    setPurchaseType(data?.PurchaseType ? data?.PurchaseType : "")
    setOrderId(data?.orderId ? data?.orderId : "")
    setRequirementId(data?.requirementId ? data?.requirementId : "")

    // Optional: If you need to track branch ID
    // if (data?.branchId) {
    //   branchIdFromApi.current = data.branchId;
    // }
  }, [id]);




  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData.data);
    }
    //  else {
    //   syncFormWithDb(undefined);
    // }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {

     
            setPoItems(
                singleOrderData?.data?.RequirementPlanningForm?.map(item => {
                    const allColors = item?.RequirementYarnDetails
                        ?.map(yarn => yarn?.Color?.name)
                        .filter(Boolean)
                        .join(" - ");
                    const RaiseIndenetYarnItems = item?.RequirementYarnDetails?.map(yarn => {
                        const qty = item?.requirementSizeDetails?.reduce(
                            (sum, size) => sum + (size?.weight * (yarn?.percentage / 100)),
                            0
                        );

                        return {
                            ...yarn,
                            qty: Number(qty.toFixed(3)),
                            orderDetailsId: item.orderDetailsId,

                        };
                    });
                    const totalYarnQty = RaiseIndenetYarnItems?.reduce(
                        (sum, yarn) => sum + yarn.qty,
                        0
                    );
                    return {
                        OrderDetails: {
                            style: {
                                name: `${item?.OrderDetails?.style?.name} / ${allColors}`
                            }
                        },
                        requirementPlanningFormId: item.id,
                        RaiseIndenetYarnItems,
                        totalYarnQty: Number(totalYarnQty?.toFixed(3)),
                    };
                })
            );
  }, [isSingleOrderFetching, isSingleOrderLoading, orderId, singleOrderData]);


    console.log(poItems,"PoItemns")


  let data = {
    transType, supplierId, dueDate, payTermId,
    branchId, id, userId,
    remarks,
    poItems: poItems?.filter(po => po.yarnId || po.fabricId || po.accessoryId || po.yarncategoryId),
    deliveryType, deliveryToId,
    discountType,
    discountValue,
    finYearId, orderId, PurchaseType, requirementId
  }
  const handleSubmitCustom = async (callback, data, text) => {
    console.log(callback, "callback")
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
        setId("")
        syncFormWithDb(undefined)
      }
    } catch (error) {
      console.log("handle");
    }
  };

  const validateData = (data) => {
    if (data.dueDate) {
      return true;
    }


    return false;
  };
  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", { position: "top-center" })
      return
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return
    }
    if (nextProcess == "draft" && !id) {
      console.log(nextProcess, "nextProcess")

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
  return (
    <>


      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PrintFormat
            data={id ? singleData?.data : "Null"}
            singleData={id ? singleData?.data : "Null"}
            date={id ? singleData?.data?.selectedDate : date}
            docId={docId ? docId : ""}

          />
        </PDFViewer>
      </Modal>

      <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Purchase Order</h1>
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>

      </div>
      <div className="space-y-3 h-full py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">



          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Basic Details
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput label="Doc. Id" readOnly value={docId} />
              <ReusableInput label="Doc Date" value={date} type={"date"} required={true} readOnly={true} disabled />
              <DateInputNew
                name="Delivery Date"
                value={dueDate}
                setValue={setDueDate}
                type={"date"}
                required={true}
                readOnly={readOnly}
              />

            </div>

          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">

            </h2>
            <div className="grid grid-cols-2 gap-1 mt-8">
              <DropdownInput name="DirectPoOrderPo"
                options={purchaseType}
                value={PurchaseType}
                setValue={setPurchaseType}
                required={true}
                readOnly={readOnly}
              />
              <DropdownInput name="Po Type"
                options={poTypes}
                value={transType}
                setValue={setTransType}
                required={true}
                readOnly={readOnly} />
              {PurchaseType === "Order Purchase" &&
                <DropdownWithSearch
                  label="Order No"
                  options={orderData?.data}
                  labelField={"docId"}
                  value={orderId}
                  required={true}
                  setValue={setOrderId}
                />
              }


              <div>
              </div>
            </div>
          </div>











          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">

            <div className="w flex flex-row gap-8 mt-8">

              <ReusableSearchableInput
                label="Supplier Id"
                component="PartyMaster"
                placeholder="Search Supplier Id..."
                optionList={allSuppliers}
                onAddItem={handleAddSupplier}
                // onDeleteItem={onDeleteItem}
                setSearchTerm={setSupplierId}
                searchTerm={supplierId}
              />

              {/* </div> */}







            </div>

          </div>
        </div>
        <fieldset className=''>
          {PurchaseType === "Order Purchase" ?

            <OrderPurchase  poItems={poItems} setPoItems={setPoItems} setRequirementId={setRequirementId}  requirementId={requirementId}
              id={id} 
            />
            :
            <></>
            // transType?.toLowerCase().includes("GreyYarn".toLowerCase())
            //   ?
            //   <YarnPoItems greyFilter={transType.toLowerCase().includes("grey")} id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
            //   :
            //   (
            //     transType?.toLowerCase().includes("DyedYarn".toLowerCase())
            //       ?
            //       <YarnPoItems greyFilter={transType.toLowerCase().includes("Dyed")} id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
            //       :
            //       <AccessoryPoItems id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
            //   )
          }

        </fieldset>

        <div className="grid grid-cols-3 gap-3">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-bold text-slate-700 mb-2 text-base">Terms & Conditions</h2>
            <textarea
              readOnly={readOnly}
              //    value={term}
              onChange={(e) => {
                //    setTerm(e.target.value)
              }}
              className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Additional notes..."

            />

          </div>




          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
            <h2 className="font-bold text-slate-700 mb-2 text-base">Notes</h2>
            <textarea
              readOnly={readOnly}
              //    value={notes}
              onChange={(e) => {
                //    setNotes(e.target.value)
              }}
              className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Additional notes..."
            />
          </div>


          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-bold text-slate-800 mb-2 text-base">
              Qty Summary
            </h2>

            <div className="space-y-1.5">
              <div className="flex justify-between py-1 text-sm">
                <span className="text-slate-800 font-bold">Total Qty</span>
                <span className="font-bold">{parseInt(getTotalQty())}   No's</span>
              </div>



              <div className="flex justify-between py-1 text-sm">
                <span className="text-slate-600 font-bold">Order By</span>
                <input
                  type="text"
                  className="w-60 pl-2.5 pr-8 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  placeholder="Order By"
                  readOnly
                //    value={orderBy}
                //    onChange={(e) => setOrderBy(e.target.value)}
                />
              </div>


            </div>
          </div>

          {showExtraCharge && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold">Add Extra Charge</h3>
                  <button onClick={() => setShowExtraCharge(false)} className="text-slate-400 hover:text-slate-600">
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Delivery fee"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
                    <input
                      type="number"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                  <button className="w-full bg-indigo-600 text-white py-1.5 px-3 rounded text-sm hover:bg-indigo-700 transition">
                    Apply Charge
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDiscount && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold">Add Discount</h3>
                  <button onClick={() => setShowDiscount(false)} className="text-slate-400 hover:text-slate-600">
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Summer promotion"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                      <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <option>Percentage</option>
                        <option>Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Value</label>
                      <input
                        type="number"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button className="w-full bg-green-600 text-white py-1.5 px-3 rounded text-sm hover:bg-green-700 transition">
                    Apply Discount
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
          {/* Left Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <FiSave className="w-4 h-4 mr-2" />
              Save & New
            </button>
            <button onClick={() => saveData("close")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <HiOutlineRefresh className="w-4 h-4 mr-2" />
              Save & Close
            </button>
            <button onClick={() => saveData("draft")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <HiOutlineRefresh className="w-4 h-4 mr-2" />
              Draft Save
            </button>
          </div>

          {/* Right Buttons */}
          <div className="flex gap-2 flex-wrap">
            {/* <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                                   <FiShare2 className="w-4 h-4 mr-2" />
                                                   Email
                                               </button> */}
            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
              onClick={() => setReadOnly(false)}
            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
              <FaWhatsapp className="w-4 h-4 mr-2" />
              WhatsApp
            </button>
            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
              onClick={() => setPrintModalOpen(true)}
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
export default PurchaseOrderForm;
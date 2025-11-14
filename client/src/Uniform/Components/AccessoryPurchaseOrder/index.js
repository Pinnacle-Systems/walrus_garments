import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useAddPoMutation, useDeletePoMutation, useGetPoByIdQuery, useGetPoQuery, useUpdatePoMutation } from "../../../redux/uniformService/PoServices";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import PurchaseOrderForm from "./AccessoryPurchaseOrderForm";
import { Loader } from "../../../Basic/components";
import { useDeleteAccessoryPoMutation, useGetAccessoryPoQuery } from "../../../redux/uniformService/AccessoryPoServices";
import AccessoryPurchaseOrderFormReport from "./AccessoryPurchaseOrderFormReport";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import { useGetAccessoryPlanningFormItemsQuery, useGetRequirementPlanningFormItemsQuery } from "../../../redux/uniformService/RequirementPlanningFormServices";




export default function Form() {






  const today = new Date()
  const componentRef = useRef();

  const [readOnly, setReadOnly] = useState(false);
  const [docId, setDocId] = useState("new")
  const [id, setId] = useState("");
  const [transType, setTransType] = useState("GreyYarn");


  const [poItems, setPoItems] = useState([]);
  const [tempPoItems, setTempPoItems] = useState([]);




  const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [poType, setPoType] = useState("Order Purchase");
  const [poMaterial, setPoMaterial] = useState("Accessory")
  const [supplierId, setSupplierId] = useState("");

  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [orderId, setOrderId] = useState("")
  const [remarks, setRemarks] = useState("")
  const [PurchaseType, setPurchaseType] = useState('General Purchase')


  const [deliveryType, setDeliveryType] = useState("")
  const [deliveryToId, setDeliveryToId] = useState("")
  const [showExtraCharge, setShowExtraCharge] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [tableDataView, setTableDataView] = useState(false)
  const [term, setTerm] = useState("")

  const [requirementId, setRequirementId] = useState("");

  const childRecord = useRef(0);
  const [purchaseOrderForm, setPurchaseOrderForm] = useState("")




  const { branchId, companyId, finYearId, userId } = getCommonParams()

  const params = {
    branchId, companyId, finYearId
  };


  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });


  const { data: taxTypeList, isLoading: isTaxLoading, isFetching: isTaxfetching } =
    useGetTaxTemplateQuery({ params: { ...params } });

  const { data: branchList } = useGetBranchQuery({ params: { ...params } });


  const { data: requirementPlanningItemsData, isLoading: isRequirementLoading, isFetching: isRequirementFetching, refetch: RequirementRefetch } = useGetAccessoryPlanningFormItemsQuery({ params });


  const [removeData] = useDeleteAccessoryPoMutation();


  const allSuppliers = supplierList ? supplierList?.data : []
  console.log(allSuppliers, "allSuppliers")
  function filterSupplier() {
    let finalSupplier = []
    if (transType.toLowerCase().includes("GreyYarn".toLowerCase())) {
      finalSupplier = allSuppliers.filter(s => s.isGy)
    } else if (transType.toLowerCase().includes("DyedYarn".toLowerCase())) {
      finalSupplier = allSuppliers.filter(s => s.isDy)
    } else {
      finalSupplier = allSuppliers.filter(s => s.isAcc)
    }
    return finalSupplier
  }
  const clientDetail = ((allSuppliers || []).filter(val => val.isClient === true));
  console.log(clientDetail, "clientDetail")

  let supplierListBasedOnSupply = filterSupplier()
  transType.toLowerCase().includes("greyyarn".toLowerCase())
  console.log(supplierListBasedOnSupply, "supplierListBasedOnSupply")
  console.log(supplierId, "supplierId")
  const payTermDay = supplierListBasedOnSupply?.find(item => item.id === Number(supplierId))?.payTermDay ?? 0;

  const columns = [
    {
      header: 'S.No',
      accessor: (item, index) => parseInt(index) + 1,
      className: 'font-medium text-gray-900 w-[20px] py-1 text-center'
    },

    {
      header: 'Inward No',
      accessor: (item) => item.docId,
      className: 'font-medium uppercase text-gray-900 w-[40px] text-left  py-1'
    },
    {
      header: 'TransType',
      accessor: (item) => item.transType,
      className: 'text-gray-800 uppercase w-[40px]  text-left  py-1 '
    },
    {
      header: 'Inward Date',
      accessor: (item) => moment.utc(item.createdAt).format("YYYY-MM-DD"),
      className: 'text-gray-800 uppercase w-[100px]  text-left  py-1  '
    },
    {
      header: 'Supplier',
      accessor: (item) => findFromList(item.supplierId, supplierList?.data, "name"),
      className: 'text-gray-800 uppercase w-[500px] text-left '
    },


  ];






  const handleView = (id) => {

    setId(id)
    setPurchaseOrderForm(true)
    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setId(id)
    setPurchaseOrderForm(true)
    setReadOnly(false);
  };

  console.log(childRecord?.current, "childrecord");


  const handleDelete = async (id) => {
    if (id) {
      if (childRecord.current > 0) {
        toast.info("Child Record Exist", { position: "top-center" })
        return

      }
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        const deletedata = await removeData(id)
        setId("");
        onNew();
        if (deletedata?.data?.statusCode == 0) {

          Swal.fire({
            title: "Deleted Successfully",
            icon: "success",
            // draggable: true,
            // timer: 1000,
            // showConfirmButton: false,
            // didOpen: () => {
            //   Swal.showLoading();
            // }
          });
        }
        else {
          Swal.fire({
            title: deletedata.data?.message,
            icon: "error",
            // draggable: true,
            // timer: 1000,
            // showConfirmButton: false,
            // didOpen: () => {
            //   Swal.showLoading();
            // }
          });
        }
      } catch (error) {
        toast.error("something went wrong");
      }
    }

  };
  const onNew = () => {
    setId("");
    setReadOnly(false);
    setPoItems([])
    setTempPoItems([])
    setDocId("New")
    setDueDate("")
    setPoMaterial("Accessory")
    setPoType("General Purchase")
    setSupplierId("")
    setDiscountType("")
    setDiscountValue(0)
    setOrderId("")
    setRemarks("")
    setTaxTemplateId("")
    setPayTermId("")
    setPurchaseType('General Purchase')
    setDeliveryType("")
    setDeliveryToId("")
    setShowExtraCharge(false)
    setRequirementId("")
  }

  // if (isLoading || isFetching) return <Loader />

  return (



    <>
      {purchaseOrderForm ? (
        <PurchaseOrderForm
          onClose={() => { setPurchaseOrderForm(false); setReadOnly(prev => !prev) }} id={id} setId={setId} readOnly={readOnly} setReadOnly={setReadOnly}
          docId={docId} setDocId={setDocId} setTempPoItems={setTempPoItems} tempPoItems={tempPoItems} poItems={poItems} setPoItems={setPoItems} onNew={onNew} supplierList={supplierList} branchList={branchList} taxTypeList={taxTypeList} requirementPlanningItemsData={requirementPlanningItemsData} isRequirementLoading={isRequirementLoading} isRequirementFetching={isRequirementFetching} RequirementRefetch={RequirementRefetch}
          date={date} setDate={setDate}
          taxTemplateId={taxTemplateId} setTaxTemplateId={setTaxTemplateId}
          payTermId={payTermId} setPayTermId={setPayTermId}
          dueDate={dueDate} setDueDate={setDueDate}
          poType={poType} setPoType={setPoType}
          poMaterial={poMaterial} setPoMaterial={setPoMaterial}
          supplierId={supplierId} setSupplierId={setSupplierId}
          discountType={discountType} setDiscountType={setDiscountType}
          discountValue={discountValue} setDiscountValue={setDiscountValue}
          orderId={orderId} setOrderId={setOrderId}
          remarks={remarks} setRemarks={setRemarks}
          PurchaseType={PurchaseType} setPurchaseType={setPurchaseType}
          deliveryType={deliveryType} setDeliveryType={setDeliveryType}
          deliveryToId={deliveryToId} setDeliveryToId={setDeliveryToId}
          showExtraCharge={showExtraCharge} setShowExtraCharge={setShowExtraCharge}
          printModalOpen={printModalOpen} setPrintModalOpen={setPrintModalOpen}
          tableDataView={tableDataView} setTableDataView={setTableDataView}
          requirementId={requirementId} setRequirementId={setRequirementId}
          term={term} setTerm={setTerm}

        />

      ) : (
        <div className="p-2 bg-[#F1F1F0] min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">

            <h1 className="text-2xl font-bold text-gray-800 mb-1 shadow-2xl">Accessory Purchase Order</h1>
            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1.5 rounded-md flex items-center gap-2 text-sm"
              onClick={() => { setPurchaseOrderForm(true); onNew() }}
            >
              <FaPlus /> Create New
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm">

            <AccessoryPurchaseOrderFormReport
              columns={columns}
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
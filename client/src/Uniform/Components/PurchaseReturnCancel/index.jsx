import { useState } from "react";
import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
// import { useGetTaxTemplateQuery } from '../../../redux/ErpServices/TaxTemplateServices';

// import { poTypes, } from '../../../Utils/DropdownData';

// import PoSummary from "./PoSummary";

import {
  useDeleteDirectCancelOrReturnMutation,
  useGetDirectCancelOrReturnQuery
}
  from "../../../redux/uniformService/DirectCancelOrReturnServices";
import { getCommonParams } from "../../../Utils/helper";

import PurchaseReturnForm from "./PurchaseReturnForm";
import { FaPlus } from "react-icons/fa";
import PurchaseCancelFormReport from "./PurchaseReturnFormReport";
import Swal from "sweetalert2";
import { useGetBranchByIdQuery, useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { useGetTermsAndConditionsQuery } from "../../../redux/services/TermsAndConditionsService";
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { usePermissionForUsers } from "../../../Basic/components/HasPermission";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";

const MODEL = "Purchase Return / Direct Return";


export default function Form() {


  const [showManufacturer, setShowManufacturer] = useState(false);
  const [id, setId] = useState("");
  const { branchId, userId, companyId, finYearId } = getCommonParams();
  const [readOnly, setReadOnly] = useState(false);
  const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectReturn");
  const [supplierId, setSupplierId] = useState("");
  const [directInwardReturnItems, setDirectInwardReturnItems] = useState([]);

  const params = {
    branchId, userId, finYearId
  };
  const { data: allData, isLoading, isFetching } = useGetDirectCancelOrReturnQuery({ params: { branchId, poInwardOrDirectInward, finYearId } });

  const [removeData] = useDeleteDirectCancelOrReturnMutation();

  const { hasPermission } = usePermissionForUsers()



  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });


  const { data: supplierDetails } =
    useGetPartyByIdQuery(supplierId, { skip: !supplierId });

  const { data: payTermList } =
    useGetPaytermMasterQuery({ params: { ...params } });

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: branchdata } = useGetBranchByIdQuery(branchId, { skip: !branchId });


  const { data: locationData } = useGetLocationMasterQuery({ params: { branchId } });
  const { data: termsAndCondition } = useGetTermsAndConditionsQuery({ params: { companyId } })
  const [invalidateTagsDispatch] = useInvalidateTags();


  const { data: itemList } =
    useGetItemMasterQuery({ params: { companyId } });

  const { data: sizeList } =
    useGetSizeMasterQuery({ params: { companyId } });

  const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching } =
    useGetColorMasterQuery({ params: { companyId } });

  const { data: uomList } =
    useGetUnitOfMeasurementMasterQuery({ params: { companyId } });



  const handleView = (id) => {

    setId(id);
    setShowManufacturer(true);
    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setId(id);
    setShowManufacturer(true);
    setReadOnly(false);
  };

  const handleDelete = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          Swal.fire({
            icon: "error",
            title: "Child record Exists",
            text: deldata.data?.message || "Data cannot be deleted!",
          });
          return;
        }
        invalidateTagsDispatch()
        setId("");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          timer: 1000,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
      }
    }
  };
  const onNew = () => {
    setId("");
    setReadOnly(false);
    setDirectInwardReturnItems([]);

  }

  function handleCreatefunction() {
    setShowManufacturer(true)
    onNew()
  } return (
    <>
      {showManufacturer ? (
        <div className="h-[calc(100vh-6rem)] min-h-0 overflow-hidden">
          <PurchaseReturnForm isLoading={isLoading} isFetching={isFetching} poInwardOrDirectInward={poInwardOrDirectInward} setPoInwardOrDirectInward={setPoInwardOrDirectInward} id={id} setId={setId} allData={allData} directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems}
            onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }} supplierId={supplierId} setSupplierId={setSupplierId}
            supplierList={supplierList} supplierDetails={supplierDetails} payTermList={payTermList} branchList={branchList}
            branchdata={branchdata} itemList={itemList} colorList={colorList} uomList={uomList} locationData={locationData}
            termsAndCondition={termsAndCondition} sizeList={sizeList} hasPermission={hasPermission} invalidateTagsDispatch={invalidateTagsDispatch}
          />
        </div>

      ) : (
        <div className="p-2 bg-[#F1F1F0] ">
          <div className="flex flex-col sm:flex-row justify-between bg-white  px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">

            <h1 className="text-2xl font-bold text-gray-800">Purchase Return</h1>

            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-2 py-1 rounded-md flex items-center gap-2 text-xs"
              onClick={() => hasPermission(handleCreatefunction, "create")}

            >
              <FaPlus /> Create New
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">

            <PurchaseCancelFormReport
              data={allData?.data || []}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div >
      )
      }
    </>
  );





























}

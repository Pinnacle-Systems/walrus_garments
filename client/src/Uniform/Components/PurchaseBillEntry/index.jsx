import { useState } from "react";
import { getCommonParams, getDateFromDateTime } from "../../../Utils/helper";
import { useDeleteBillEntryMutation, useGetBillEntryQuery } from "../../../redux/uniformService/BillEntryServices";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import { PurchaseBillEntry } from "./PurchaseBillEntryForm";
import PurchaseBillEntryFormReport from "./PurchaseInwardFormReport";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";






export default function Form() {

  const { branchId, companyId, finYearId, userId } = getCommonParams()


  const params = {
    branchId, companyId
  };

  const { data: taxTypeList } = useGetTaxTemplateQuery({ params: { ...params } });
  const { data: supplierList } = useGetPartyQuery({});

  const { data: allData, isLoading, isFetching } = useGetBillEntryQuery({
    params: {
      branchId,
      finYearId,
    }
  });
  const today = new Date()
  const [inwardItemSelection, setInwardItemSelection] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [poType, setPoType] = useState("DyedYarn");
  const [supplierId, setSupplierId] = useState("");
  const [docId, setDocId] = useState("New");

  const [summary, setSummary] = useState(false)

  const [inwardItems, setInwardItems] = useState([]);

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [partyBillNo, setPartyBillNo] = useState("")
  const [partyBillDate, setPartyBillDate] = useState("")
  const [netBillValue, setNetBillValue] = useState("")
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [showManufacturer, setShowManufacturer] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [selectedFinYear, setSelectedFinYear] = useState("")
  const [contextMenu, setContextMenu] = useState(false)






  const [removeData] = useDeleteBillEntryMutation();




  const handleView = (id) => {

    setId(id)
    setShowManufacturer(true)
    setReadOnly(true);
  };

  const handleEdit = (orderId) => {
    setId(orderId)
    setShowManufacturer(true)
    setReadOnly(false);
  };

  const handleDelete = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id)
        setId("");
        onNew();
        // toast.success("Deleted Successfully");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          draggable: true,
          timer: 1000,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
      } catch (error) {
        toast.error("something went wrong");
      }
    }

  };
  const onNew = () => {
    setId("");
    setReadOnly(false);
    setSupplierId("")
  }

  return (
    <>
      {showManufacturer ? (
        <PurchaseBillEntry
          inwardItemSelection={inwardItemSelection}
          setInwardItemSelection={setInwardItemSelection}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          id={id}
          setId={setId}
          date={date}
          setDate={setDate}
          poType={poType}
          setPoType={setPoType}
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          docId={docId}
          setDocId={setDocId}
          summary={summary}
          setSummary={setSummary}
          inwardItems={inwardItems}
          setInwardItems={setInwardItems}
          formReport={formReport}
          setFormReport={setFormReport}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          partyBillNo={partyBillNo}
          setPartyBillNo={setPartyBillNo}
          partyBillDate={partyBillDate}
          setPartyBillDate={setPartyBillDate}
          netBillValue={netBillValue}
          setNetBillValue={setNetBillValue}
          taxTemplateId={taxTemplateId}
          setTaxTemplateId={setTaxTemplateId}
          onClose={() => setShowManufacturer(false)}
          contextMenu={contextMenu} setContextMenu={setContextMenu}
          supplierList={supplierList} taxTypeList={taxTypeList}
        />

      ) : (
        <div className="p-2 bg-[#F1F1F0] min-h-screen">
          <h1 className="text-2xl font-bold text-gray-800">Purchase Bill Entry</h1>
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
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
              onClick={() => { setShowManufacturer(true); onNew() }}
            >
              <FaPlus /> Create New
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* <CommonTable
                            columns={columns}
                            data={allData?.data || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            itemsPerPage={10}
                        /> */}
            <PurchaseBillEntryFormReport

              data={allData?.data || []}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}
    </>
  );
};


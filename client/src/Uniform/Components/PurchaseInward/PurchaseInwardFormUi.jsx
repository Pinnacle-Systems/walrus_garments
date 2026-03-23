import { useCallback, useEffect, useRef, useState } from "react";
import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { FaFileAlt } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DateInput, DropdownInput, ReusableSearchableInputNewCustomerwithBranches, TextInput } from "../../../Inputs";
import { directOrPo } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import { FiEdit2, FiPrinter, FiSave, FiChevronDown } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import { useAddDirectInwardOrReturnMutation, useGetDirectInwardOrReturnByIdQuery, useUpdateDirectInwardOrReturnMutation } from "../../../redux/uniformService/DirectInwardOrReturnServices";
import moment from "moment";
import Modal from "../../../UiComponents/Modal";
import PoItemsSelection from "./PoItemsSelection";
import YarnPoItems from "./YarnPoItems";
import YarnInwardPoItems from "./YarnInwardItem";
import Swal from "sweetalert2";
import BarCodePrintFormat from "./BarcodePrintFormat";
import { useGetItemMasterQuery, useGetItemPriceListQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";

const PurchaseInwardForm = ({
  hasPermission, addData, onClose, id, setId, docId, setDocId, date, setDate,
  readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate,
  supplierId, setSupplierId, payTermId, setPayTermId,
  locationId, setLocationId, storeId, setStoreId,
  poInwardOrDirectInward, setPoInwardOrDirectInward,
  inwardItemSelection, setInwardItemSelection,
  directInwardReturnItems, setDirectInwardReturnItems,
  partyId, setPartyId, onNew, branchList, locationData,
  supplierList, yarnList, colorList, uomList,
}) => {
  const [headerOpen, setHeaderOpen] = useState(true);
  const [vehicleNo, setVehicleNo] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [remarks, setRemarks] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [contextMenu, setContextMenu] = useState(false);
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);

  const childRecord = useRef(0);
  const { branchId, companyId, userId, finYearId } = getCommonParams();
  const branchIdFromApi = useRef(branchId);
  const params = { branchId, companyId };

  const inwardTyperef = useRef(null);
  const branchRef = useRef(null);
  const locationRef = useRef(null);
  const partyRef = useRef(null);

  const storeOptions = locationData
    ? locationData?.data?.filter((item) => parseInt(item.locationId) === parseInt(branchId))
    : [];

  const { data: itemPriceList } = useGetItemPriceListQuery({ params: { ...params } });
  const { data: supplierDetails } = useGetPartyByIdQuery(supplierId, { skip: !supplierId });
  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });

  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } =
    useGetDirectInwardOrReturnByIdQuery(id, { skip: !id });

  // const [addData] = useAddDirectInwardOrReturnMutation();
  const [updateData] = useUpdateDirectInwardOrReturnMutation();

  useEffect(() => {
    if (inwardTyperef.current && !id) inwardTyperef.current.focus();
  }, []);

  const syncFormWithDb = useCallback((data) => {
    const today = new Date();
    if (id) setReadOnly(true);
    else setReadOnly(false);
    setTransType(data?.poType ?? "DyedYarn");
    setPoInwardOrDirectInward(data?.poInwardOrDirectInward ?? "DirectInward");
    setDate(
      data?.createdAt
        ? moment.utc(data.createdAt).format("YYYY-MM-DD")
        : moment.utc(today).format("YYYY-MM-DD")
    );
    setDirectInwardReturnItems(data?.DirectItems ?? []);
    if (data?.docId) setDocId(data?.docId);
    if (data?.date) setDate(data?.date);
    setPartyId(data?.supplierId ?? "");
    setPayTermId(data?.payTermId ?? "");
    setSupplierId(data?.supplierId ?? "");
    setDcDate(
      data?.dcDate
        ? moment.utc(data?.dcDate).format("YYYY-MM-DD")
        : moment.utc(today).format("YYYY-MM-DD")
    );
    setDcNo(data?.dcNo ?? "");
    setLocationId(data?.branchId ?? "");
    setStoreId(data?.storeId ?? "");
    setVehicleNo(data?.vehicleNo ?? "");
    setSpecialInstructions(data?.specialInstructions ?? "");
    setRemarks(data?.remarks ?? "");
    if (data?.branchId) branchIdFromApi.current = data?.branchId;
  }, [id]);

  useEffect(() => {
    if (id) syncFormWithDb(singleData?.data);
    else syncFormWithDb(undefined);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    docId, poType: transType, poInwardOrDirectInward,
    supplierId, dcDate, payTermId, id, userId, storeId,
    directInwardReturnItems: directInwardReturnItems?.filter((i) => i.itemId),
    discountType, discountValue, dcNo, remarks, specialInstructions,
    vehicleNo, finYearId,
    locationId: locationId ? parseInt(locationId) : undefined,
    partyId, branchId,
  };

  const validateData = (d) =>
    !!(d?.partyId && d?.branchId && d?.storeId && d?.poInwardOrDirectInward && d?.poType && d?.dcDate);

  const handleSubmitCustom = async (callback, payload, text, nextProcess) => {
    try {
      const returnData = await callback(payload).unwrap();
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        Swal.fire({ icon: "success", title: `${text || "Saved"} Successfully`, showConfirmButton: false });
        if (returnData.statusCode === 0) {
          if (nextProcess === "new") {
            syncFormWithDb(undefined)
            onNew();
          } else {
            onClose()
          }

        } else {
          toast.error(returnData?.message);
        }
      }
    } catch (error) {
      console.log("handle", error);
    }
  };

  function removeItem(removeId) {
    setDirectInwardReturnItems((items) =>
      structuredClone(items).filter((item) => parseInt(item.poItemsId) !== parseInt(removeId))
    );
  }

  const saveData = (nextProcess) => {
    const mandatoryFields = ["itemId", "sizeId", "colorId", "uomId", "qty", "price"];
    if (!validateData(data)) {
      Swal.fire({ title: "Please fill all required fields...!", icon: "warning" });
      return;
    }
    if (!isGridDatasValid(data?.directInwardReturnItems?.filter((i) => i.itemId), false, mandatoryFields)) {
      Swal.fire({ title: "Please fill all Po Items Mandatory fields...!", icon: "warning" });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) return;

    if (nextProcess === "draft" && !id)
      handleSubmitCustom(addData, { ...data, draftSave: true }, "Added", nextProcess);
    else if (id && nextProcess === "draft")
      handleSubmitCustom(updateData, { ...data, draftSave: true }, "Updated", nextProcess);
    else if (id)
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    else
      handleSubmitCustom(addData, data, "Added", nextProcess);
  };

  function isSupplierOutside() {
    return supplierDetails ? supplierDetails?.data?.City?.state?.name !== "TAMIL NADU" : false;
  }

  const handleRightClick = (event, rowIndex, type) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, rowId: rowIndex, type });
  };

  const handleCloseContextMenu = () => setContextMenu(null);

  return (
    <>
      <Modal isOpen={inwardItemSelection} onClose={() => setInwardItemSelection(false)} widthClass="w-[95%] h-[85%] py-10">
        <PoItemsSelection
          setInwardItemSelection={setInwardItemSelection} transtype={transType}
          supplierId={partyId} inwardItems={directInwardReturnItems}
          setInwardItems={setDirectInwardReturnItems} poInwardOrDirectInward={poInwardOrDirectInward}
        />
      </Modal>
      <Modal isOpen={barcodePrintOpen} onClose={() => setBarcodePrintOpen(false)} widthClass="px-2 h-[90%] w-[90%]">
        <BarCodePrintFormat data={directInwardReturnItems} sizeList={sizeList} itemList={itemList}
          itemPriceList={itemPriceList}
        />
      </Modal>

      {/* ── Page title bar ── */}
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Purchase Inward</h1>
          <button onClick={onClose} className="text-indigo-600 hover:text-indigo-700" title="Open Report">
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col h-full mt-2 gap-2">

        {/* ── Accordion wrapping ALL header cards ── */}
        <div className="border border-slate-200 bg-white rounded-md shadow-sm">

          {/* Accordion toggle bar */}
          <button
            type="button"
            onClick={() => setHeaderOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors"
          >
            <span className="font-medium text-slate-700 text-sm">Header Details</span>
            <FiChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${headerOpen ? "rotate-180" : "rotate-0"
                }`}
            />
          </button>

          {/* ── FIX: overflow-visible when open so dropdowns are not clipped ── */}
          <div
            className={`transition-all duration-300 ease-in-out ${headerOpen
              ? "max-h-[600px] opacity-100 overflow-visible"
              : "max-h-0 opacity-0 overflow-hidden"
              }`}
          >
            <div className="px-2 pb-2 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 overflow-visible">

                {/* Basic Details */}
                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                  <h2 className="font-medium text-slate-700 mb-2">Basic Details</h2>
                  <div className="grid grid-cols-2 gap-1">
                    <ReusableInput label="Purchase Inward No" readOnly value={docId} />
                    <ReusableInput label="Purchase Inward Date" value={date} type="date" required readOnly disabled />
                  </div>
                </div>

                {/* Inward Details */}
                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                  <h2 className="font-medium text-slate-700 mb-2">Inward Details</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <DropdownInput
                      name="Inward Type"
                      beforeChange={() => setDirectInwardReturnItems([])}
                      options={directOrPo}
                      value={poInwardOrDirectInward}
                      setValue={setPoInwardOrDirectInward}
                      required readOnly={readOnly}
                      ref={inwardTyperef}
                    />
                    <DropdownInput
                      name="Branch"
                      options={
                        branchList
                          ? dropDownListObject(
                            id ? branchList?.data : branchList?.data?.filter((item) => item.active),
                            "branchName", "id"
                          )
                          : []
                      }
                      value={branchId}
                      setValue={(value) => { setLocationId(value); setStoreId(""); }}
                      required ref={branchRef}
                    />
                    <DropdownInput
                      name="Location"
                      options={dropDownListObject(
                        id
                          ? storeOptions
                          : storeOptions?.filter(i => i.storeName.includes("NEW")),
                        "storeName", "id"
                      )}
                      value={storeId}
                      setValue={setStoreId}
                      required ref={locationRef}
                    />
                  </div>
                </div>{console.log(storeOptions, 'storeOptions')}

                {/* Supplier Details — overflow-visible so the searchable dropdown escapes */}
                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1 overflow-visible">
                  <h2 className="font-medium text-slate-700 mb-2">Supplier Details</h2>
                  <div className="grid grid-cols-2 gap-2 overflow-visible">
                    <div className="col-span-3 overflow-visible">
                      <ReusableSearchableInputNewCustomerwithBranches
                        label="Supplier Name"
                        component="PartyMaster"
                        placeholder="Search Supplier Name..."
                        optionList={supplierList?.data}
                        setSearchTerm={(value) => setPartyId(value)}
                        searchTerm={partyId}
                        show="isSupplier"
                        required disabled={id}
                        ref={partyRef}
                      />
                    </div>
                    <TextInput name="Dc No." value={dcNo} setValue={setDcNo} readOnly={readOnly} required />
                    <DateInput name="Dc Date" value={dcDate} setValue={setDcDate} required readOnly={readOnly} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="overflow-auto">
          <fieldset className="h-full">
            {poInwardOrDirectInward === "DirectInward" && (
              <YarnPoItems
                id={id}
                poItems={directInwardReturnItems}
                setPoItems={setDirectInwardReturnItems}
                setInwardItemSelection={setInwardItemSelection}
                supplierId={partyId}
                handleRightClick={handleRightClick}
                contextMenu={contextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                yarnList={yarnList}
                colorList={colorList}
                uomList={uomList}
                itemList={itemList}
                sizeList={sizeList}
                headerOpen={headerOpen}
                itemPriceList={itemPriceList}
              />
            )}
            {(poInwardOrDirectInward === "PurchaseInward" || poInwardOrDirectInward === "GeneralInward") && (
              <YarnInwardPoItems
                inwardItems={directInwardReturnItems}
                setInwardItems={setDirectInwardReturnItems}
                removeItem={removeItem}
                transType={transType}
                purchaseInwardId={id}
                params={params}
                supplierId={partyId}
                readOnly={readOnly}
                isSupplierOutside={isSupplierOutside()}
                setInwardItemSelection={setInwardItemSelection}
                id={id}
                handleRightClick={handleRightClick}
                contextMenu={contextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                yarnList={yarnList}
                colorList={colorList}
                uomList={uomList}
              />
            )}
          </fieldset>
        </div>

        <div className="flex flex-col md:flex-row gap-2 justify-between mt-0">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => hasPermission(() => saveData("new"), "create")}

              className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <FiSave className="w-4 h-4 mr-2" />
              Save & New
            </button>
            <button
              onClick={() => hasPermission(() => saveData("close"), "create")}
              className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <HiOutlineRefresh className="w-4 h-4 mr-2" />
              Save & Close
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
              // onClick={() => setReadOnly(false)}
              onClick={() => hasPermission(() => setReadOnly(false), "edit")}

            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 flex items-center text-sm"
              onClick={() => {
                if (directInwardReturnItems?.filter((i) => i.itemId)?.length === 0) {
                  Swal.fire({ icon: "warning", title: "Please Fill At Least One Inward Item" });
                  return;
                }
                setBarcodePrintOpen(true);
              }}
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Barcode
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default PurchaseInwardForm;
import { useCallback, useEffect, useRef, useState } from "react";
import { getCommonParams, isGridDatasValid, ModeChip } from "../../../Utils/helper";
import { ReusableInput } from "../Order/CommonInput";
import {
  childRecordCount,
  DateInput,
  DateInputNew,
  DropdownInput,
  ReusableSearchableInputNewCustomerwithBranches,
  TextInput,
} from "../../../Inputs";
import { directOrPo } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import {
  useAddDirectInwardOrReturnMutation,
  useGetDirectInwardOrReturnByIdQuery,
  useUpdateDirectInwardOrReturnMutation,
} from "../../../redux/uniformService/DirectInwardOrReturnServices";
import moment from "moment";
import Modal from "../../../UiComponents/Modal";
import PoItemsSelection from "./PoItemsSelection";
import YarnPoItems from "./YarnPoItems";
import YarnInwardPoItems from "./YarnInwardItem";
import Swal from "sweetalert2";
import BarCodePrintFormat from "./BarcodePrintFormat";
import {
  useGetItemMasterQuery,
  useGetItemPriceListQuery,
} from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import TransactionEntryShell from "../ReusableComponents/TransactionEntryShell";
import TransactionHeaderSection from "../ReusableComponents/TransactionHeaderSection";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";

const PurchaseInwardForm = ({
  hasPermission,
  addData,
  onClose,
  id,
  setId,
  docId,
  setDocId,
  date,
  setDate,
  readOnly,
  setReadOnly,
  transType,
  setTransType,
  dcNo,
  setDcNo,
  dcDate,
  setDcDate,
  supplierId,
  setSupplierId,
  payTermId,
  setPayTermId,
  locationId,
  setLocationId,
  storeId,
  setStoreId,
  poInwardOrDirectInward,
  setPoInwardOrDirectInward,
  inwardItemSelection,
  setInwardItemSelection,
  directInwardReturnItems,
  setDirectInwardReturnItems,
  partyId,
  setPartyId,
  onNew,
  branchList,
  locationData,
  supplierList,
  yarnList,
  colorList,
  uomList,
  invalidateTagsDispatch,
}) => {
  const [headerOpen, setHeaderOpen] = useState(true);
  const [vehicleNo, setVehicleNo] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [remarks, setRemarks] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [contextMenu, setContextMenu] = useState(false);
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [childRecord, setChildRecord] = useState(0);
  const { branchId, companyId, userId, finYearId } = getCommonParams();
  const branchIdFromApi = useRef(branchId);
  const params = { branchId, companyId };
  const activeItemParams = { ...params, active: true };

  const inwardTyperef = useRef(null);
  const branchRef = useRef(null);
  const locationRef = useRef(null);
  const partyRef = useRef(null);




  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
  const {
    firstInputRef: nameRef,
    movedToNextSaveNewRef,
    saveNewButtonRef,
    saveCloseButtonRef,
  } = refs;


  const storeOptions = locationData
    ? locationData?.data?.filter(
      (item) => parseInt(item.locationId) === parseInt(branchId),
    )
    : [];

  const { data: itemPriceList } = useGetItemPriceListQuery({
    params: { ...params },
  });
  const { data: supplierDetails } = useGetPartyByIdQuery(supplierId, {
    skip: !supplierId,
  });
  const { data: itemList } = useGetItemMasterQuery({ params: activeItemParams });
  const { data: sizeList } = useGetSizeMasterQuery({ params });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetDirectInwardOrReturnByIdQuery({ id, isReturnBalanceInwardItems: false }, { skip: !id });

  const { data: stockControlData } = useGetStockReportControlQuery({ params });

  // const [addData] = useAddDirectInwardOrReturnMutation();
  const [updateData] = useUpdateDirectInwardOrReturnMutation();

  useEffect(() => {
    if (inwardTyperef.current && !id) inwardTyperef.current.focus();
  }, []);

  console.log(readOnly, "readOnly")

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      // if (id) setReadOnly(true);
      // else setReadOnly(false);
      setTransType(data?.poType ?? "DyedYarn");
      setPoInwardOrDirectInward(data?.poInwardOrDirectInward ?? "DirectInward");
      setDate(
        data?.createdAt
          ? moment.utc(data.createdAt).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD"),
      );
      setDirectInwardReturnItems(data?.DirectItems ? data?.DirectItems?.map(i => ({
        ...i,
        qty: i.qty ? parseInt(i.qty).toFixed(3) : "0.000",
        price: i.price ? parseInt(i.price).toFixed(2) : "0.00",

      })) : [])
      if (data?.docId) setDocId(data?.docId);
      if (data?.date) setDate(data?.date);
      setPartyId(data?.supplierId ?? "");
      setPayTermId(data?.payTermId ?? "");
      setSupplierId(data?.supplierId ?? "");
      setDcDate(
        data?.dcDate
          ? moment.utc(data?.dcDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD"),
      );
      setDcNo(data?.dcNo ?? "");
      setLocationId(data?.branchId ?? "");
      setStoreId(data?.storeId ?? "");
      setVehicleNo(data?.vehicleNo ?? "");
      setSpecialInstructions(data?.specialInstructions ?? "");
      setRemarks(data?.remarks ?? "");
      setChildRecord(data?._count ? childRecordCount(data?._count) : "0")
      if (data?.branchId) branchIdFromApi.current = data?.branchId;
    },
    [id],
  );

  useEffect(() => {
    if (id) syncFormWithDb(singleData?.data);
    else syncFormWithDb(undefined);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    docId,
    poType: transType,
    poInwardOrDirectInward,
    supplierId,
    dcDate,
    payTermId,
    id,
    userId,
    storeId,
    directInwardReturnItems: directInwardReturnItems?.filter((i) => i.itemId),
    discountType,
    discountValue,
    dcNo,
    remarks,
    specialInstructions,
    vehicleNo,
    finYearId,
    locationId: locationId ? parseInt(locationId) : undefined,
    partyId,
    branchId,
  };

  const validateData = (d) =>
    !!(
      d?.partyId &&
      d?.branchId &&
      d?.storeId &&
      d?.poInwardOrDirectInward &&
      d?.poType &&
      d?.dcDate
    );

  const handleSubmitCustom = async (callback, payload, text, nextProcess) => {
    try {
      const returnData = await callback(payload).unwrap();
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        Swal.fire({
          icon: "success",
          title: `${text || "Saved"} Successfully`,
          showConfirmButton: true,
        });
        invalidateTagsDispatch();
        if (returnData.statusCode === 0) {
          if (nextProcess === "new") {
            syncFormWithDb(undefined);
            onNew();
          } else {
            onClose();
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
      structuredClone(items).filter(
        (item) => parseInt(item.poItemsId) !== parseInt(removeId),
      ),
    );
  }

  const branchName =
    branchList?.data?.find((item) => String(item.id) === String(branchId))
      ?.branchName || "";
  const locationName =
    storeOptions?.find((item) => String(item.id) === String(storeId))
      ?.storeName || "";
  const supplierName =
    supplierList?.data?.find((item) => String(item.id) === String(partyId))
      ?.aliasName ||
    supplierList?.data?.find((item) => String(item.id) === String(partyId))
      ?.name ||
    "";

  const saveData = (nextProcess) => {
    const config = stockControlData?.data?.[0];
    const mandatoryFields = [
      ...(config?.itemWise ? ["itemId"] : []),
      ...(config?.sizeWise ? ["sizeId"] : []),
      ...(config?.sizeColorWise ? ["colorId"] : []),
      ...Object.keys(config || {})
        .filter((key) => key.toLowerCase().includes("field") && !!config[key])
        .map((key) => key),
      "uomId",
      "barcode",
      "qty",
      "price",
    ];
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "warning",
      });
      return;
    }


    const hasDuplicate = (arr) =>
      new Set(arr.map(i => i.barcode)).size !== arr.length;

    if (hasDuplicate(data?.directInwardReturnItems)) {
      Swal.fire({
        title: "Same Barcode Found in Multiple Lines",
        icon: "warning",
      });
      return;
    }

    if (
      !isGridDatasValid(
        data?.directInwardReturnItems?.filter((i) => i.itemId),
        false,
        mandatoryFields,
      )
    ) {
      Swal.fire({
        title: "Please fill all Po Items Mandatory fields...!",
        icon: "warning",
      });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) return;

    if (nextProcess === "draft" && !id)
      handleSubmitCustom(
        addData,
        { ...data, draftSave: true },
        "Added",
        nextProcess,
      );
    else if (id && nextProcess === "draft")
      handleSubmitCustom(
        updateData,
        { ...data, draftSave: true },
        "Updated",
        nextProcess,
      );
    else if (id) handleSubmitCustom(updateData, data, "Updated", nextProcess);
    else handleSubmitCustom(addData, data, "Added", nextProcess);
  };

  function isSupplierOutside() {
    return supplierDetails
      ? supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
      : false;
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

  const handleCloseContextMenu = () => setContextMenu(null);

  const summaryItems = [
    { label: "Purchase Inward No", value: docId },
    { label: "Purchase Inward Date", value: date },
    // { label: "Type", value: poInwardOrDirectInward },
    // { label: "Branch", value: branchName },
    { label: "Location", value: locationName },
    { label: "Supplier", value: supplierName },
    { label: "DC No", value: dcNo },
    { label: "DC Date", value: dcDate },
  ];

  const footerContent = (
    <div className="flex flex-col justify-between gap-2 md:flex-row">
      <div className="flex flex-wrap gap-2">

        <button
          onClick={() => hasPermission(() => saveData("close"), "create")}
          ref={saveCloseButtonRef}
          tabIndex={0}
          onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
          className="flex items-center rounded-md bg-indigo-500 px-4 py-1 text-sm text-white hover:bg-indigo-600"
          disabled={readOnly}

        >
          <HiOutlineRefresh className="mr-2 h-4 w-4" />
          Save & Close
        </button>
        <button
          onClick={() => hasPermission(() => saveData("new"), "create")}
          ref={saveNewButtonRef}
          onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
          disabled={readOnly}

          className="flex items-center rounded-md bg-indigo-500 px-4 py-1 text-sm text-white hover:bg-indigo-600"
        >
          <FiSave className="mr-2 h-4 w-4" />
          Save & New
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="flex items-center rounded-md bg-yellow-600 px-4 py-1 text-sm text-white hover:bg-yellow-700"
          onClick={() => hasPermission(() => setReadOnly(false), "edit")}

        >
          <FiEdit2 className="mr-2 h-4 w-4" />
          Edit
        </button>
        <button
          className="flex items-center rounded-md bg-blue-600 px-4 py-1 text-sm text-white hover:bg-blue-700"
          onClick={() => {
            if (
              directInwardReturnItems?.filter((i) => i.itemId)?.length === 0
            ) {
              Swal.fire({
                icon: "warning",
                title: "Please Fill At Least One Inward Item",
              });
              return;
            }
            setBarcodePrintOpen(true);
          }}
          disabled={readOnly}

        >
          <FiPrinter className="mr-2 h-4 w-4" />
          Barcode
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={inwardItemSelection}
        onClose={() => setInwardItemSelection(false)}
        widthClass="w-[95%] h-[85%] py-10"
      >
        <PoItemsSelection
          setInwardItemSelection={setInwardItemSelection}
          transtype={transType}
          supplierId={partyId}
          inwardItems={directInwardReturnItems}
          setInwardItems={setDirectInwardReturnItems}
          poInwardOrDirectInward={poInwardOrDirectInward}
        />
      </Modal>
      <Modal
        isOpen={barcodePrintOpen}
        onClose={() => setBarcodePrintOpen(false)}
        widthClass="px-2 h-[90%] w-[90%]"
      >
        <BarCodePrintFormat
          data={directInwardReturnItems}
          sizeList={sizeList}
          itemList={itemList}
          itemPriceList={itemPriceList}
        />
      </Modal>

      <TransactionEntryShell
        title="Purchase Inward"
        readOnly={readOnly}
        id={id}
        onClose={onClose}
        headerOpen={headerOpen}
        setHeaderOpen={setHeaderOpen}
        summaryItems={summaryItems}
        openStateClassName="max-h-[320px] headerContent opacity-100 overflow-visible"
        headerContent={
          <div className="grid grid-cols-1  gap-3 overflow-visible md:grid-cols-2">
            <TransactionHeaderSection
              title="Basic Details"
              bodyClassName="grid-cols-12 gap-1.5 overflow-visible"
            >
              <div className="col-span-2">

                <ReusableInput
                  label="Inward No"
                  readOnly
                  value={docId}
                />
              </div>
              <div className="col-span-2">

                <ReusableInput
                  label="Inward Date"
                  value={date}
                  type="date"
                  required
                  readOnly
                  disabled
                />
              </div>

              <div className="col-span-2">
                <DropdownInput
                  name="Inward Type"
                  beforeChange={() => setDirectInwardReturnItems([])}
                  options={directOrPo}
                  value={poInwardOrDirectInward}
                  setValue={setPoInwardOrDirectInward}
                  required
                  disabled={childRecord > 0}
                  readOnly={readOnly}
                  ref={inwardTyperef}
                />
              </div>
              <div className="col-span-3">

                <DropdownInput
                  name="Branch"
                  options={
                    branchList
                      ? dropDownListObject(
                        id
                          ? branchList?.data
                          : branchList?.data?.filter((item) => item.active),
                        "branchName",
                        "id",
                      )
                      : []
                  }
                  value={branchId}
                  setValue={(value) => {
                    setLocationId(value);
                    setStoreId("");
                  }}
                  disabled={childRecord > 0}

                  required
                  ref={branchRef}
                  readOnly={readOnly}

                />
              </div>
              <div className="col-span-3">
              <DropdownInput
                name="Location"
                options={dropDownListObject(
                  id
                    ? storeOptions
                    : storeOptions?.filter(
                      (item) => item.storeName.includes("WAREHOUSE") && item.active,
                    ),
                  "storeName",
                  "id",
                )}
                value={storeId}
                setValue={setStoreId}
                required
                ref={locationRef}
                readOnly={readOnly}
                disabled={childRecord > 0}


              />
              </div>
            </TransactionHeaderSection>
            {/* 
            <TransactionHeaderSection
              title="Inward Details"
              bodyClassName="grid-cols-2 gap-1.5"
            >
              <DropdownInput
                name="Inward Type"
                beforeChange={() => setDirectInwardReturnItems([])}
                options={directOrPo}
                value={poInwardOrDirectInward}
                setValue={setPoInwardOrDirectInward}
                required
                disabled={childRecord > 0}
                readOnly={readOnly}
                ref={inwardTyperef}
              />
              <DropdownInput
                name="Branch"
                options={
                  branchList
                    ? dropDownListObject(
                      id
                        ? branchList?.data
                        : branchList?.data?.filter((item) => item.active),
                      "branchName",
                      "id",
                    )
                    : []
                }
                value={branchId}
                setValue={(value) => {
                  setLocationId(value);
                  setStoreId("");
                }}
                disabled={childRecord > 0}

                required
                ref={branchRef}
                readOnly={readOnly}

              />
              <DropdownInput
                name="Location"
                options={dropDownListObject(
                  id
                    ? storeOptions
                    : storeOptions?.filter(
                      (item) => item.storeName.includes("WAREHOUSE") && item.active,
                    ),
                  "storeName",
                  "id",
                )}
                value={storeId}
                setValue={setStoreId}
                required
                ref={locationRef}
                readOnly={readOnly}
                disabled={childRecord > 0}


              />
            </TransactionHeaderSection> */}

            <TransactionHeaderSection
              title="Supplier Details"
              className="overflow-visible"
              bodyClassName="grid-cols-12 gap-1.5 overflow-visible"
            >
              <div className="col-span-8 overflow-visible">
                <ReusableSearchableInputNewCustomerwithBranches
                  label="Supplier Name"
                  component="PartyMaster"
                  placeholder="Search Supplier Name..."
                  optionList={supplierList?.data}
                  setSearchTerm={(value) => setPartyId(value)}
                  searchTerm={partyId}
                  show="isSupplier"
                  required
                  disabled={id}
                  ref={partyRef}
                />
              </div>
              <div className="col-span-2">
                <TextInput
                  name="Dc No."
                  value={dcNo}
                  setValue={setDcNo}
                  readOnly={readOnly}
                  disabled={childRecord > 0}

                  required
                />
              </div>
              <div className="col-span-2">
                <DateInput
                  name="Dc Date"
                  value={dcDate}
                  setValue={setDcDate}
                  required
                  readOnly={readOnly}
                  disabled={childRecord > 0}

                />
              </div>

            </TransactionHeaderSection>
          </div>
        }
        footer={footerContent}
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          <fieldset className="h-full min-h-0">
            {poInwardOrDirectInward === "DirectInward" && (
              <YarnPoItems
                id={id}
                poItems={directInwardReturnItems}
                setPoItems={setDirectInwardReturnItems}
                setDirectInwardReturnItems={setDirectInwardReturnItems}
                directInwardReturnItems={directInwardReturnItems}
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
                movedToNextSaveNewRef={movedToNextSaveNewRef}
                saveNewButtonRef={saveNewButtonRef}
                handlers={handlers}
                readOnly={readOnly}
              />
            )}
            {(poInwardOrDirectInward === "PurchaseInward" ||
              poInwardOrDirectInward === "GeneralInward") && (
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
      </TransactionEntryShell>
    </>
  );
};

export default PurchaseInwardForm;

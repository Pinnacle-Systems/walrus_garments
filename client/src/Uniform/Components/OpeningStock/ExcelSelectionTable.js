import React from "react";
import { read, utils } from "xlsx";
import { convertSpaceToUnderScore, getCommonParams } from "../../../Utils/helper";
import { useGetItemMasterQuery, useAddItemMasterMutation } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery, useAddSizeMasterMutation } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { FiDownload, FiSave } from "react-icons/fi";
import { FaQuestionCircle } from "react-icons/fa";
import { useAddLegacyStockMutation } from "../../../redux/uniformService/LegacyStockService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useGetUnitOfMeasurementMasterQuery, useAddUnitOfMeasurementMasterMutation } from "../../../redux/uniformService/UnitOfMeasurementServices";
import Select from "react-select";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";

const OPENING_STOCK_HEADERS = [
  "Item Name",
  "Size",
  "Uom",
  "Barcode No",
  "Price",
  "Qty"
];

const OPENING_STOCK_TEMPLATE_ROW = {
  "Item Name": "Classic T-Shirt",
  "Size": "XL",
  "Uom": "PCS",
  "Barcode No": "TSHIRT-XL-0001",
  "Price": "499",
  "Qty": "10"
};

const escapeCsvValue = (value) => {
  const stringValue = value?.toString() ?? "";
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const ExcelSelectionTable = ({ file, setFile, pres, setPres, params, stockItems, setStockItems }) => {
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [selectedBranchId, setSelectedBranchId] = React.useState("");
  const [selectedLocationId, setSelectedLocationId] = React.useState("");
  const [editingCell, setEditingCell] = React.useState(null);

  React.useEffect(() => {
    if (branchId) {
      setSelectedBranchId(branchId);
    }
  }, [branchId]);


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  console.log(file, "file for Invoice")


  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: locationList } = useGetLocationMasterQuery({ params: { branchId: selectedBranchId } });

  const branchOptions = branchList?.data?.map(b => ({ value: b.id, label: b.branchName })) || [];
  const locationOptions = locationList?.data?.map(l => ({ value: l.id, label: l.storeName })) || [];


  const [addData] = useAddLegacyStockMutation();
  const [addItem] = useAddItemMasterMutation();
  const [addSize] = useAddSizeMasterMutation();
  const [addUom] = useAddUnitOfMeasurementMasterMutation();

  const uomOptions = (uomList?.data || []).map(u => ({ value: u.id, label: u.name }));

  const saveData = async () => {
    if (!selectedBranchId) {
      toast.warning("Please select a branch.");
      return;
    }
    if (!selectedLocationId) {
      toast.warning("Please select a location.");
      return;
    }

    const missingBarcodesRow = stockItems.findIndex(r => !r.barcode_no?.toString().trim());
    if (missingBarcodesRow !== -1) {
      toast.warning(`Barcode is missing at row ${missingBarcodesRow + 1}`);
      return;
    }

    // --- Barcode Duplicate Check ---
    const barcodeMap = {};
    const barcodeConflicts = [];
    stockItems.forEach((row) => {
      const bc = row.barcode_no?.toString().trim();
      if (!bc) return;
      const identifier = `${row.item_name}|${row.size || ""}`.toLowerCase();
      if (barcodeMap[bc] && barcodeMap[bc] !== identifier) {
        barcodeConflicts.push(`Barcode "${bc}" is used for multiple items/sizes.`);
      }
      barcodeMap[bc] = identifier;
    });
    if (barcodeConflicts.length > 0) {
      const uniqueConflicts = [...new Set(barcodeConflicts)];
      Swal.fire({ icon: "error", title: "Barcode Conflict", text: uniqueConflicts[0], footer: "Same barcode cannot be assigned to different items or sizes." });
      return;
    }

    // Identify missing items
    const missingItems = [...new Set(
      stockItems
        .filter(r => r.item_name && !findFromList(r.item_name, itemList?.data, "id"))
        .map(r => r.item_name)
    )];

    if (missingItems.length > 0) {
      const result = await Swal.fire({
        title: "Missing Item Masters",
        html: `The following item names are not in the master:<br/><b>${missingItems.map(n => n.toUpperCase()).join(", ")}</b><br/><br/>Create them automatically and save?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, create & save",
        cancelButtonText: "Cancel",
      });
      if (!result.isConfirmed) return;
    } else {
      if (!window.confirm("Are you sure you want to save these details?")) return;
    }

    try {
      Swal.fire({
        title: "Processing...",
        text: "Please wait while we save master records and stock.",
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); },
      });

      // --- Auto-create missing Sizes ---
      const newSizeIdMap = {};
      const missingSizes = [...new Set(
        stockItems.filter(r => r.size && !findFromList(r.size, sizeList?.data, "id")).map(r => r.size)
      )];
      for (const s of missingSizes) {
        const res = await addSize({ name: s.toUpperCase(), code: s.toUpperCase(), companyId, branchId, active: true }).unwrap();
        if (res.data?.id) newSizeIdMap[s.toLowerCase().trim()] = res.data.id;
      }

      // --- Ensure PCS UOM exists; create if missing ---
      let pcsId = findFromList("PCS", uomList?.data, "id");
      if (!pcsId) {
        const res = await addUom({ name: "PCS", code: "PCS", companyId, branchId, active: true }).unwrap();
        if (res.data?.id) pcsId = res.data.id;
      }

      // --- Auto-create missing Item masters ---
      const newItemIdMap = {};
      for (const itm of missingItems) {
        const res = await addItem({
          name: itm.toUpperCase(),
          active: true,
          companyId,
          branchId,
          storeId: selectedLocationId,
          itemPriceList: [{ sizeId: null, colorId: null, offerPrice: 0, salesPrice: 0 }]
        }).unwrap();
        if (res.data?.data?.id || res.data?.id) {
          newItemIdMap[itm.toLowerCase().trim()] = res.data?.data?.id || res.data?.id;
        }
      }

      console.log(newItemIdMap, "newItemIdMap")

      // --- Map all stock items with newly created IDs ---
      const mappedStockItems = await stockItems.map(row => {
        const itemKey = (row.item_name || "").toString().trim().toLowerCase();
        const sizeKey = (row.size || "").toString().trim().toLowerCase();

        const newlyCreatedItemId = newItemIdMap[itemKey];
        const newlyCreatedSizeId = newSizeIdMap[sizeKey];

        // Use overridden UOM from row if set, else from uomList; else default PCS
        const resolvedUomId = row.uomId || row._uomId ||
          findFromList(row.uom, uomList?.data, "id") ||
          pcsId ||
          null;

        return {
          ...row,
          itemId: newlyCreatedItemId || row.itemId || findFromList(row.item_name, itemList?.data, "id"),
          sizeId: newlyCreatedSizeId || row.sizeId || findFromList(row.size, sizeList?.data, "id") || null,
          colorId: row.colorId || findFromList(row.color, colorList?.data, "id") || null,
          uomId: resolvedUomId,
        };
      });

      // Update state so the UI reflects the new IDs
      setStockItems(mappedStockItems);

      const payload = {
        branchId: selectedBranchId,
        storeId: selectedLocationId,
        companyId,
        finYearId,
        userId,
        stockItems: mappedStockItems.map(({ _rowId, item_name, size, color, uom, ...rest }) => rest)
      };

      const returnData = await addData(payload).unwrap();
      if (returnData.statusCode === 1) {
        Swal.fire({ icon: "error", title: returnData?.message, showConfirmButton: false });
      } else if (returnData.statusCode === 0) {
        Swal.fire({ icon: "success", title: "Stock Added Successfully", showConfirmButton: false });
      } else {
        toast.error(returnData?.message);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save: " + (err.data?.message || err.message), "error");
    }
  };





  function findFromList(name, list, property) {
    if (!list || !name) return ""
    const trimmedName = name.toString().trim().toLowerCase();
    let data = list?.find(i => (i.name || "").toString().trim().toLowerCase() === trimmedName)
    if (!data) return ""
    return data[property]
  }






  const uploadFile = () => {
    if (!file) {
      toast.warning("Please select a file first.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);

      const workbook = read(data, { type: "array" });
      console.log(workbook, "workbook")

      const worksheetName = workbook.SheetNames[0];
      console.log(worksheetName, "worksheetName")

      const worksheet = workbook.Sheets[worksheetName];
      console.log(worksheet, "worksheet")

      // const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      const jsonData = utils.sheet_to_json(worksheet, { header: 1, raw: false });


      const headerNames = jsonData.shift();

      console.log(jsonData, "jsonData")
      console.log(headerNames, "headerNames")

      let transformedData = jsonData
        .filter(row => row.some(cell => cell !== undefined && cell !== null && cell.toString().trim() !== ""))
        .map((row) => {
          const obj = { _rowId: Date.now() + Math.random() };
          headerNames.forEach((header, index) => {
            const key = convertSpaceToUnderScore(header);
            obj[key] = row[index];
          });

          // Pre-populate IDs if they exist in master
          const itemName = obj.item_name;
          const sizeName = obj.size;
          const colorName = obj.color;
          const uomName = obj.uom;

          obj.itemId = findFromList(itemName, itemList?.data, "id");
          obj.sizeId = findFromList(sizeName, sizeList?.data, "id") || null;
          obj.colorId = findFromList(colorName, colorList?.data, "id") || null;
          obj.uomId = findFromList(uomName, uomList?.data, "id") || null;
          obj.branchId = branchId;
          obj.storeId = selectedLocationId;
          obj.companyId = companyId;
          obj.finYearId = finYearId;
          obj.userId = userId;

          return obj;
        });
      console.log(transformedData, "transformedData")

      setStockItems(transformedData);
    };



    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = (event.loaded / event.total) * 100;
        console.log(`Loading progress: ${percentLoaded}%`);
      }
    };



    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const csvRows = [
      OPENING_STOCK_HEADERS.map(escapeCsvValue).join(","),
      OPENING_STOCK_HEADERS.map((header) => escapeCsvValue(OPENING_STOCK_TEMPLATE_ROW[header])).join(",")
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "opening-stock-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full ">
      <div className="w-full flex flex-col gap-5">
        <div className="mt-3 flex flex-col justify-start items-start gap-4">
          <div className="w-full flex flex-col gap-3 xl:flex-row xl:justify-between xl:items-end">
            <div className="flex flex-wrap items-end gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Select Branch</label>
                <div className="w-72"

                >
                  <Select
                    options={branchOptions}
                    value={branchOptions.find(o => o.value === selectedBranchId)}
                    onChange={o => { setSelectedBranchId(o?.value || ""); setSelectedLocationId(""); }}
                    placeholder="Branch..."
                    styles={{ control: (b) => ({ ...b, minHeight: "30px", height: "30px", fontSize: "12px" }), indicatorsContainer: (b) => ({ ...b, height: "30px" }) }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Select Location</label>
                <div className="w-72">
                  <Select
                    options={locationOptions}
                    value={locationOptions.find(o => o.value === selectedLocationId)}
                    onChange={o => setSelectedLocationId(o?.value || "")}
                    placeholder="Location..."
                    isClearable
                    styles={{ control: (b) => ({ ...b, minHeight: "30px", height: "30px", fontSize: "12px" }), indicatorsContainer: (b) => ({ ...b, height: "30px" }) }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-xs font-bold text-gray-600">Upload File</h1>
                <div className='flex items-center border border-lime-500 hover:bg-lime-500 transition rounded-md h-8 px-3 cursor-pointer group'>
                  <input type="file" id="profileImage" accept=".csv,.xlsx,.xls" className='hidden' onChange={handleFileChange} />
                  <label htmlFor="profileImage" className="text-xs w-full font-bold text-center cursor-pointer group-hover:text-white transition">Browse</label>
                </div>
              </div>
              <button
                onClick={uploadFile}
                className="bg-lime-600 text-white px-4 py-1.5 rounded-md hover:bg-lime-700 text-xs font-bold h-8 transition-colors"
              >
                Upload
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="h-8 px-4 py-1.5 rounded-md border border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  Download Template
                </button>
                <div className="relative z-30 group">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Opening stock import template help"
                  >
                    <FaQuestionCircle className="text-sm cursor-help" />
                  </button>
                  <div className="pointer-events-none absolute top-full right-0 z-[80] mt-2 w-56 rounded-md bg-slate-800 px-3 py-2 text-[11px] leading-4 text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    Download the CSV template, fill it in Excel, then upload the completed file here.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row mt-1 xl:w-52">
              <button
                onClick={saveData}
                className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm font-semibold shadow-sm transition-all"
              >
                <FiSave className="w-4 h-4 mr-2" />
                Save Stock
              </button>
              <button
                onClick={() => {
                  setStockItems([]);
                  setFile(null);
                  const input = document.getElementById("profileImage");
                  if (input) input.value = "";
                }}
                className="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 flex items-center text-sm font-semibold shadow-sm transition-all ml-2"
              >
                New
              </button>
            </div>
          </div>


          <div className="overflow-x-auto w-full h-[500px] overflow-y-auto">
            <table className="min-w-full table-fixed ">
              <thead className='bg-gray-200 sticky top-0'>
                <tr>
                  <th className="border border-gray-400 text-sm py-1 w-12 text-center">S.No</th>
                  {OPENING_STOCK_HEADERS.map((columnName, index) => (
                    <th className="border border-gray-400 text-sm py-1 capitalize px-2 text-center" key={index}>
                      {columnName}</th>
                  ))}
                  <th className="border border-gray-400 text-sm py-1 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const barcodeCounts = {};
                  stockItems?.forEach(row => {
                    const bc = row.barcode_no?.toString().trim().toLowerCase();
                    if (!bc) return;
                    const iden = `${row.item_name}|${row.size || ""}`.toLowerCase();
                    if (!barcodeCounts[bc]) barcodeCounts[bc] = new Set();
                    barcodeCounts[bc].add(iden);
                  });

                  return stockItems?.map((row, rowIndex) => {
                    const itemId = row.itemId || findFromList(row.item_name, itemList?.data, "id");
                    const sizeId = row.sizeId || findFromList(row.size, sizeList?.data, "id");
                    const colorId = row.colorId || findFromList(row.color, colorList?.data, "id");
                    const uomId = row.uomId || row._uomId || findFromList(row.uom, uomList?.data, "id");

                    const bc = row.barcode_no?.toString().trim().toLowerCase();
                    const isBarcodeConflict = bc && barcodeCounts[bc]?.size > 1;

                    return (
                      <tr key={row._rowId || rowIndex} className="border-b hover:bg-gray-50">
                        <td className="border border-gray-400 text-center text-xs py-1">{rowIndex + 1}</td>
                        {OPENING_STOCK_HEADERS.map((columnName, columnIndex) => {
                          const key = convertSpaceToUnderScore(columnName);
                          const val = row[key];
                          const isEmpty = !val || val.toString().trim() === "";
                          let isInvalid = false;
                          if (key === "item_name" && isEmpty) isInvalid = true;
                          if (key === "item_name" && !isEmpty && !itemId) isInvalid = true;
                          if (key === "size" && isEmpty) isInvalid = true;
                          if (key === "size" && !isEmpty && !sizeId) isInvalid = true;
                          if (key === "uom" && isEmpty && !row._uomId) isInvalid = true;
                          if (key === "uom" && !isEmpty && !uomId) isInvalid = true;
                          if (key === "color" && !isEmpty && !colorId) isInvalid = true;
                          if (key === "barcode_no" && isEmpty) isInvalid = true;

                          // UOM column → inline select dropdown
                          if (key === "uom") {
                            const pcsDefaultId = findFromList("PCS", uomList?.data, "id") || "";
                            const selectedUomId = row._uomId || findFromList(row.uom, uomList?.data, "id") || pcsDefaultId;
                            return (
                              <td key={columnIndex} className={`border border-gray-400 text-xs py-0.5 px-1 ${!selectedUomId ? "bg-red-100" : ""}`}>
                                <select
                                  value={selectedUomId}
                                  onChange={(e) => {
                                    setStockItems(prev => prev.map(r =>
                                      r._rowId === row._rowId ? { ...r, _uomId: e.target.value } : r
                                    ));
                                  }}
                                  className={`w-full text-xs py-0.5 rounded border-0 bg-transparent outline-none cursor-pointer ${!selectedUomId ? "text-red-700 font-semibold" : "text-gray-700"}`}
                                >
                                  <option value="">-- Select UOM --</option>
                                  {uomOptions.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                              </td>
                            );
                          }

                          const rowKey = row._rowId || rowIndex;

                          return (
                            <td
                              key={columnIndex}
                              className={`border border-gray-400 text-xs py-0.5 px-1 ${isInvalid ? "bg-red-100 text-red-700 font-semibold" : ""}`}
                              onDoubleClick={() => setEditingCell({ rowId: rowKey, key })}
                            >
                              {editingCell?.rowId === rowKey && editingCell?.key === key ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={val || ""}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setStockItems(prev => prev.map((r, idx) =>
                                      (r._rowId || idx) === rowKey ? { ...r, [key]: newValue } : r
                                    ));
                                  }}
                                  onBlur={() => setEditingCell(null)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') setEditingCell(null); }}
                                  className="w-full text-xs py-0.5 rounded outline-none border border-blue-400 px-1"
                                />
                              ) : (
                                <div className="w-full min-h-[20px] flex items-center cursor-pointer">{val}</div>
                              )}
                            </td>
                          );
                        })}
                        <td className="border border-gray-400 text-center px-1">
                          <button
                            onClick={() => setStockItems(prev => prev.filter((r, idx) => (r._rowId || idx) !== (row._rowId || rowIndex)))}
                            className="bg-red-500 text-white p-1 rounded hover:bg-red-600 inline-flex items-center justify-center"
                            title="Delete Row"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>



        </div>
      </div>
    </div>

  );
};

export default ExcelSelectionTable;

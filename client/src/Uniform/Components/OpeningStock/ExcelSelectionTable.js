import React from "react";
import { read, utils } from "xlsx";
import { convertSpaceToUnderScore, getCommonParams } from "../../../Utils/helper";
import moment from 'moment'
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { FiSave, FiPlus, FiSettings } from "react-icons/fi";
import { useAddLegacyStockMutation } from "../../../redux/uniformService/LegacyStockService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import QuickAddItemModal from "./QuickAddItemModal";
import Select from "react-select";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";

const ExcelSelectionTable = ({ file, setFile, pres, setPres, params, stockItems, setStockItems }) => {

  const [modalState, setModalState] = React.useState({ open: false, rowId: null, value: "", editItem: null });
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [selectedBranchId, setSelectedBranchId] = React.useState("");
  const [selectedLocationId, setSelectedLocationId] = React.useState("");

  React.useEffect(() => {
    if (branchId) {
      setSelectedBranchId(branchId);
    }
  }, [branchId]);


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: locationList } = useGetLocationMasterQuery({ params: { branchId: selectedBranchId } });

  const branchOptions = branchList?.data?.map(b => ({ value: b.id, label: b.branchName })) || [];
  const locationOptions = locationList?.data?.map(l => ({ value: l.id, label: l.storeName })) || [];


  const [addData] = useAddLegacyStockMutation();


  const data = {
    pres, branchId, companyId, finYearId, userId, stockItems
  }

  const handleSubmitCustom = async (callback, payload, text, nextProcess) => {
    try {
      const returnData = await callback(payload).unwrap();
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        Swal.fire({ icon: "success", title: `${text || "Saved"} Successfully`, showConfirmButton: false });
        if (returnData.statusCode === 0) {
          // if (nextProcess === "new") {
          //     syncFormWithDb(undefined)
          // } else {
          //     onClose()
          // }

        } else {
          toast.error(returnData?.message);
        }
      }
    } catch (error) {
      console.log("handle", error);
    }
  };

  const saveData = () => {
    const mappedStockItems = stockItems.map(row => ({
      ...row,
      itemId: findFromList(row.item_name, itemList?.data, "id"),
      sizeId: findFromList(row.size, sizeList?.data, "id"),
      colorId: findFromList(row.color, colorList?.data, "id"),
      uomId: findFromList(row.uom, uomList?.data, "id"),
    }));

    const invalidRows = mappedStockItems.filter(r =>
      !r.itemId ||
      (r.size && !r.sizeId) ||
      (r.color && !r.colorId) ||
      (r.uom && !r.uomId)
    );

    if (invalidRows.length > 0) {
      toast.warning(`Please fix ${invalidRows.length} invalid rows before saving.`);
      return;
    }

    // --- Barcode Duplicate Check ---
    const barcodeMap = {};
    const barcodeConflicts = [];

    mappedStockItems.forEach((row, idx) => {
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
      Swal.fire({
        icon: "error",
        title: "Barcode Conflict",
        text: uniqueConflicts[0],
        footer: "Same barcode cannot be assigned to different items or sizes."
      });
      return;
    }

    if (!selectedBranchId) {
      toast.warning("Please select a branch.");
      return;
    }
    if (!selectedLocationId) {
      toast.warning("Please select a location.");
      return;
    }

    if (!window.confirm("Are you sure you want to save these details?")) {
      return;
    }

    const payload = {
      branchId: selectedBranchId,
      locationId: selectedLocationId,
      companyId,
      finYearId,
      userId,
      stockItems: mappedStockItems.map(({ _rowId, item_name, size, color, uom, ...rest }) => rest)
    };

    handleSubmitCustom(addData, payload, "Added");
  };





  function findFromList(name, list, property) {
    if (!list || !name) return ""
    const trimmedName = name.toString().trim().toLowerCase();
    let data = list?.find(i => (i.name || "").toString().trim().toLowerCase() === trimmedName)
    if (!data) return ""
    return data[property]
  }






  const uploadFile = () => {

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
          return obj;
        });

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



  const header = [
    "Item Name",
    "Size",
    "Color",
    "Uom",
    "Barcode No",
    "Price",
    "Qty"
  ]

  return (
    <div className="w-full ">
      <div className="w-full flex flex-col gap-5">
        <div className="mt-3 flex flex-col justify-start items-start gap-4">
          <div className="w-full flex flex-row justify-between items-end">
            <div className="flex flex-wrap items-end gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Select Branch</label>
                <div className="w-48">
                  <Select
                    options={branchOptions}
                    value={branchOptions.find(o => o.value === selectedBranchId)}
                    onChange={o => { setSelectedBranchId(o?.value || ""); setSelectedLocationId(""); }}
                    placeholder="Branch..."
                    isClearable
                    styles={{ control: (b) => ({ ...b, minHeight: "30px", height: "30px", fontSize: "12px" }), indicatorsContainer: (b) => ({ ...b, height: "30px" }) }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Select Location</label>
                <div className="w-48">
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
                  <input type="file" id="profileImage" className='hidden' onChange={handleFileChange} />
                  <label htmlFor="profileImage" className="text-xs w-full font-bold text-center cursor-pointer group-hover:text-white transition">Browse</label>
                </div>
              </div>
              <button
                onClick={uploadFile}
                className="bg-lime-600 text-white px-4 py-1.5 rounded-md hover:bg-lime-700 text-xs font-bold h-8 transition-colors"
              >
                Upload
              </button>
            </div>
            <div>
              <button
                onClick={saveData}
                className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm font-semibold shadow-sm transition-all"
              >
                <FiSave className="w-4 h-4 mr-2" />
                Save Stock
              </button>
            </div>
          </div>


          <div className="overflow-x-auto w-full h-[500px] overflow-y-auto">
            <table className="min-w-full table-fixed ">
              <thead className='bg-gray-200 sticky top-0'>
                <tr>
                  <th className="border border-gray-400 text-sm py-1 w-12 text-center">S.No</th>
                  {header.map((columnName, index) => (
                    <th className="border border-gray-400 text-sm py-1 capitalize px-2 text-left" key={index}>
                      {columnName}</th>
                  ))}
                  <th className="border border-gray-400 text-sm py-1 w-20 text-center">Action</th>
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
                    const itemId = findFromList(row.item_name, itemList?.data, "id");
                    const sizeId = findFromList(row.size, sizeList?.data, "id");
                    const colorId = findFromList(row.color, colorList?.data, "id");
                    const uomId = findFromList(row.uom, uomList?.data, "id");

                    const bc = row.barcode_no?.toString().trim().toLowerCase();
                    const isBarcodeConflict = bc && barcodeCounts[bc]?.size > 1;

                    return (
                      <tr key={row._rowId || rowIndex} className="hover:bg-gray-50 border-b">
                        <td className="border border-gray-400 text-center text-xs py-1">{rowIndex + 1}</td>
                        {header.map((columnName, columnIndex) => {
                          const key = convertSpaceToUnderScore(columnName);
                          const val = row[key];
                          let isInvalid = false;
                          if (key === "item_name" && !itemId) isInvalid = true;
                          if (key === "size" && !sizeId && val) isInvalid = true;
                          if (key === "color" && !colorId && val) isInvalid = true;
                          if (key === "uom" && !uomId && val) isInvalid = true;
                          if (key === "barcode_no" && isBarcodeConflict) isInvalid = true;

                          return (
                            <td key={columnIndex} className={`border border-gray-400 text-xs py-1 px-2 ${isInvalid ? "bg-red-50 text-red-600 font-semibold" : ""}`}>
                              {val}
                            </td>
                          );
                        })}
                        <td className="border border-gray-400 text-center py-1">
                          <div className="flex justify-center gap-1">
                            {!itemId ? (
                              <button
                                onClick={() => setModalState({ open: true, rowId: row._rowId, value: row.item_name, editItem: null })}
                                className="bg-indigo-50 text-indigo-600 p-1 rounded hover:bg-indigo-100"
                                title="Create Item"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            ) : (
                              // Item exists, but maybe variant is missing?
                              ((row.size && !sizeId) || (row.color && !colorId)) && (
                                <button
                                  onClick={() => {
                                    const itemToEdit = itemList?.data?.find(i => i.id === itemId);
                                    setModalState({ open: true, rowId: row._rowId, value: row.item_name, editItem: itemToEdit });
                                  }}
                                  className="bg-orange-50 text-orange-600 p-1 rounded hover:bg-orange-100"
                                  title="Manage Item Variants"
                                >
                                  <FiSettings className="w-4 h-4" />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {modalState.open && (
            <QuickAddItemModal
              isOpen={modalState.open}
              onClose={() => setModalState({ open: false, rowId: null, value: "", editItem: null })}
              itemName={modalState.value}
              itemToEdit={modalState.editItem}
              onCreated={(newItem) => {
                setModalState({ open: false, rowId: null, value: "", editItem: null });
                toast.success(`Item "${newItem.name}" ${modalState.editItem ? "updated" : "created"} and mapped.`);
              }}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default ExcelSelectionTable;

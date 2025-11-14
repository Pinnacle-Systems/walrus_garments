import { useState } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { getImageUrlPath } from "../../../helper";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";

import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";
import { useGetSocksTypeQuery } from "../../../redux/uniformService/SocksTypeMasterService";
import { useGetYarnNeedleMasterQuery } from "../../../redux/uniformService/YarnNeedleMasterservices";
import { useGetFiberContentMasterQuery } from "../../../redux/uniformService/FiberContentMasterServices";
import { getCommonParams, renameFile } from '../../../Utils/helper';
import { useGetMachineQuery } from "../../../redux/services/MachineMasterService";
import { CLOSE_ICON, DELETE, VIEW } from '../../../icons';
// import TableGridItems from './TableGridItems';
import Modal from "../../../UiComponents/Modal";
import { FaInfoCircle } from 'react-icons/fa';
import FabricDirectInwardItems from './FabricDirectInwardItems';
import AccessoryDirectInwardItems from './AccessoryDirectInwardItems';
import FabricInwardItems from './FabricInwardItems';
import AccessoryInwardItems from './AccessoryInwardItems';
import YarnInwardItems from './YarnInwardItems';
import YarnDirectInwardItems from './YarnDirectInwardItems';
import Swal from 'sweetalert2';

export default function ReturnItems({ isSupplierOutside, removeItem, transType, poInwardOrDirectInward, storeId, setStoreId, readOnly, directInwardReturnItems, setDirectInwardReturnItems, id, supplierId, setInwardItemSelection,

    supplierList, supplierDetails, payTermList, branchList,
    branchdata, yarnList, colorList, uomList, setSupplierId

}) {
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [tableDataView, setTableDataView] = useState(false)
    const [currentItem, setCurrentItem] = useState();
    const [currentIndex, setCurrentIndex] = useState("");
    const [gridEditableIndex, setGridEditableIndex] = useState(null);
    const [contextMenu, setContextMenu] = useState(false)

    const params = {
        branchId, userId, finYearId
    };






    function openPreview(filePath) {
        window.open(filePath instanceof File ? URL.createObjectURL(filePath) : getImageUrlPath(filePath))
    }

    function handleEdit(index) {
        setGridEditableIndex(index)
    }

    function handleView(index) {
        setCurrentIndex(index)
        setTableDataView(true)
    }



    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        const newBlend = structuredClone(directInwardReturnItems);
        newBlend[index][field] = value
        console.log(poItem, "poItem")
        if (poItem) {

            newBlend[index]["poNo"] = poItem?.DirectInwardOrReturn?.docId
            newBlend[index]["yarnId"] = poItem?.yarnId
            newBlend[index]["colorId"] = poItem?.colorId
            newBlend[index]["gaugeId"] = poItem?.gaugeId
            newBlend[index]["gsmId"] = poItem?.gsmId
            newBlend[index]["fDiaId"] = poItem?.fDiaId
            newBlend[index]["designId"] = poItem?.designId
            newBlend[index]["discountAmount"] = poItem?.discountAmount
            newBlend[index]["discountType"] = poItem?.discountType
            newBlend[index]["kDiaId"] = poItem?.kDiaId
            newBlend[index]["loopLengthId"] = poItem?.loopLengthId
            newBlend[index]["poId"] = poItem?.poId
            newBlend[index]["price"] = poItem?.price
            newBlend[index]["taxPercent"] = poItem?.taxPercent
            newBlend[index]["uomId"] = poItem?.uomId
            newBlend[index]["poQty"] = poItem?.qty
            newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedQty ? parseFloat(poItem.alreadyInwardedQty).toFixed(3) : "0.000";
            newBlend[index]["alreadyInwardedRolls"] = poItem?.alreadyInwardedRolls ? parseInt(poItem.alreadyInwardedRolls) : "0";
            newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedQty ? parseFloat(poItem.alreadyReturnedQty).toFixed(3) : "0.000";
            newBlend[index]["alreadyReturnedRolls"] = poItem?.alreadyReturnedData?._sum?.noOfRolls ? parseInt(poItem.alreadyReturnedData._sum.noOfRolls) : "0";
            newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";
            newBlend[index]["stockQty"] = parseFloat(poItem?.stockQty).toFixed(3)
            newBlend[index]["stockRolls"] = parseInt(poItem?.stockRolls)
            newBlend[index]["allowedReturnRolls"] = poItem?.allowedReturnRolls
            newBlend[index]["allowedReturnQty"] = parseFloat(poItem?.allowedReturnQty).toFixed(3)
        }
        if (field === "qty") {
            if (parseFloat(balanceQty) < parseFloat(value)) {
                toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                return
            }
        }
        setDirectInwardReturnItems(newBlend);
    };
    console.log(directInwardReturnItems, "directInwardReturnItems")

    function handleInputChangeLotNo(value, index, lotIndex, field, stockQty, allowedReturnQty) {
        const balanceQty = Math.min(stockQty, allowedReturnQty);
        setDirectInwardReturnItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]["returnLotDetails"]) return inwardItems
            if (field == "qty") {
                if (parseFloat(balanceQty) < parseFloat(value)) {
                    toast.info("Return Qty Can not be more than balance Qty", { position: 'top-center' })
                    return newBlend
                }
            }
            newBlend[index]["returnLotDetails"][lotIndex][field] = value;
            if (field == "noOfRolls") {
                let totalValue = newBlend[index]["returnLotDetails"].reduce((accumulator, currentValue) => accumulator + parseInt(currentValue?.noOfRolls), 0);
                newBlend[index][field] = totalValue;
            }
            if (field == "qty") {
                let totalValue = parseFloat(newBlend[index]["returnLotDetails"].reduce((accumulator, currentValue) => accumulator + parseFloat(currentValue?.qty), 0)).toFixed(3);
                newBlend[index][field] = totalValue;
            }
            return newBlend
        });
    }
    function addNewLotNo(index) {
        setDirectInwardReturnItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]) return inwardItems
            if (newBlend[index]["returnLotDetails"]) {
                newBlend[index]["returnLotDetails"] = [
                    ...newBlend[index]["returnLotDetails"],
                    { lotNo: "", qty: "0.000", noOfRolls: 0 }]
            } else {
                newBlend[index]["returnLotDetails"] = [{ lotNo: "", qty: "0.000", noOfRolls: 0 }]
            }
            return newBlend
        })
    }
    function removeLotNo(index, lotIndex) {
        setDirectInwardReturnItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]["returnLotDetails"]) return inwardItems
            newBlend[index]["returnLotDetails"] = newBlend[index]["returnLotDetails"].filter((_, index) => index != lotIndex)
            return newBlend
        })
    }


    const addNewRow = () => {
        const newRow = {
            yarnId: "",
            qty: "",
            tax: "0",
            colorId: "",
            uomId: "",
            price: "",
            discountTypes: "",
            discountValue: "0.00",
            noOfBags: "0.00"
        };
        setDirectInwardReturnItems([...directInwardReturnItems, newRow]);
    };


    const deleteRow = (id) => {
        setDirectInwardReturnItems((yarnBlend) =>
            yarnBlend?.filter((row, index) => index !== parseInt(id))
        );
    };

    function handleDeleteAllRows(index) {
        setDirectInwardReturnItems([index])
    }

    function handleView(index) {
        setCurrentIndex(index)
        setTableDataView(true)
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
            <div className="p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-slate-700">List Of Items</h2>
                    <button className="font-bold text-slate-700 bord"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                setInwardItemSelection(true)

                            }
                        }}
                        onClick={() => {
                            if (!supplierId) {
                                Swal.fire({
                                    icon: 'success',
                                    title: ` Choose Supplier`,
                                    showConfirmButton: false,
                                    timer: 2000
                                });
                            }
                            else {

                                setInwardItemSelection(true)
                            }
                        }}
                    >
                        Fill Inward Items
                    </button>
                </div>
                <fieldset className=' rounded-tr-lg rounded-bl-lg rounded-br-lg my-1  md:pb-5 flex 
                    max-h-[250px] w-full overflow-auto'>

                    {

                        poInwardOrDirectInward == "DirectReturn" &&


                        <YarnDirectInwardItems handleInputChange={handleInputChange} removeLotNo={removeLotNo} addNewLotNo={addNewLotNo}
                            handleInputChangeLotNo={handleInputChangeLotNo}
                            storeId={storeId} deleteRow={deleteRow} transType={transType} purchaseInwardId={id} params={params}
                            directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()}
                            supplierList={supplierList} supplierDetails={supplierDetails} payTermList={payTermList} branchList={branchList}
                            branchdata={branchdata} yarnList={yarnList} colorList={colorList} uomList={uomList}
                        />


                    }
                    {
                        (poInwardOrDirectInward === "PurchaseReturn" || poInwardOrDirectInward === "GeneralReturn") &&

                        <YarnInwardItems purchaseInwardId={id} deleteRow={deleteRow} handleEdit={handleEdit}
                            storeId={storeId} handleView={handleView}
                            transType={transType} directInwardReturnItems={directInwardReturnItems}
                            setDirectInwardReturnItems={setDirectInwardReturnItems}
                            readOnly={readOnly} isSupplierOutside={isSupplierOutside()} handleDeleteRow={deleteRow} handleDeleteAllRows={handleDeleteAllRows}
                            handleRightClick={handleRightClick} contextMenu={contextMenu} handleCloseContextMenu={handleCloseContextMenu}

                            supplierList={supplierList} supplierDetails={supplierDetails} payTermList={payTermList} branchList={branchList}
                            branchdata={branchdata} yarnList={yarnList} colorList={colorList} uomList={uomList}
                        />

                    }
                </fieldset>
            </div>
        </>



    );
}



import { useState } from 'react';
import { toast } from 'react-toastify';
import { getImageUrlPath } from "../../../helper";

import { getCommonParams } from '../../../Utils/helper';
// import TableGridItems from './TableGridItems';
import YarnDirectInwardItems from './YarnDirectInwardItems';
import Swal from 'sweetalert2';
import { useGetStockReportControlQuery } from '../../../redux/uniformService/StockReportControl.Services';

export default function ReturnItems({ isSupplierOutside, transType, poInwardOrDirectInward, storeId, readOnly, directInwardReturnItems, setDirectInwardReturnItems, id, supplierId, setInwardItemSelection,

    supplierList, supplierDetails, payTermList, branchList,
    branchdata, itemList, colorList, uomList, sizeList, purchaseInwardId, itemPriceList, headerOpen, movedToNextSaveNewRef, handlers,

}) {
    const { branchId, userId, finYearId } = getCommonParams();
    const [tableDataView, setTableDataView] = useState(false)
    const [currentItem, setCurrentItem] = useState();
    const [currentIndex, setCurrentIndex] = useState("");
    const [gridEditableIndex, setGridEditableIndex] = useState(null);
    const [contextMenu, setContextMenu] = useState(false)

    const params = {
        branchId, userId, finYearId
    };

    const { data: stockControlData, isLoading, isFetching } = useGetStockReportControlQuery({ params });


    const getBarcodeFromList = (itemId, sizeId, colorId) => {



        if (!itemPriceList?.data || !itemId || !sizeId) return null;
        return itemPriceList.data.find(item =>
            String(item.itemId) === String(itemId) &&
            String(item.sizeId) === String(sizeId) &&
            (colorId ? String(item.colorId) === String(colorId) : !item.colorId)
        );
    };





    console.log(directInwardReturnItems, 'directInwardReturnItems')


    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        const newBlend = structuredClone(directInwardReturnItems);



        if (poItem) {


            const foundPrice = getBarcodeFromList(poItem?.itemId, poItem?.sizeId, poItem?.colorId);


            newBlend[index]["poNo"] = poItem?.DirectInwardOrReturn?.docId
            newBlend[index]["itemId"] = poItem?.itemId
            newBlend[index]["sizeId"] = poItem?.sizeId

            newBlend[index]["colorId"] = poItem?.colorId
            newBlend[index]["poId"] = poItem?.poId
            newBlend[index]["price"] = poItem?.price
            newBlend[index]["taxPercent"] = poItem?.taxPercent
            newBlend[index]["uomId"] = poItem?.uomId
            newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedQty ? parseFloat(poItem.alreadyInwardedQty).toFixed(3) : "0.000";
            newBlend[index]["alreadyInwardedRolls"] = poItem?.alreadyInwardedRolls ? parseInt(poItem.alreadyInwardedRolls) : "0";
            newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedQty ? parseFloat(poItem.alreadyReturnedQty).toFixed(3) : "0.000";
            newBlend[index]["alreadyReturnedRolls"] = poItem?.alreadyReturnedData?._sum?.noOfRolls ? parseInt(poItem.alreadyReturnedData._sum.noOfRolls) : "0";
            newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";
            newBlend[index]["stockQty"] = parseFloat(poItem?.stockQty).toFixed(3)
            newBlend[index]["allowedReturnQty"] = parseFloat(poItem?.allowedReturnQty).toFixed(3)
            newBlend[index]["barcode"] = foundPrice?.barcode
        } else {
            newBlend[index][field] = value

        }

        setDirectInwardReturnItems((prev) => {
            const updated = [...prev];
            updated[index] = newBlend[index];
            return updated;
        });
    };

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




    const deleteRow = (id) => {
        setDirectInwardReturnItems((yarnBlend) =>
            yarnBlend?.filter((row, index) => index !== parseInt(id))
        );
    };







    return (
        <>
            <div className="h-full min-h-0 overflow-hidden">

                {

                    poInwardOrDirectInward == "DirectReturn" &&


                    <YarnDirectInwardItems handleInputChange={handleInputChange} removeLotNo={removeLotNo} addNewLotNo={addNewLotNo}
                        handleInputChangeLotNo={handleInputChangeLotNo}
                        storeId={storeId} deleteRow={deleteRow} transType={transType} purchaseInwardId={purchaseInwardId} params={params}
                        directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()}
                        supplierList={supplierList} supplierDetails={supplierDetails} payTermList={payTermList} branchList={branchList}
                        branchdata={branchdata} itemList={itemList} colorList={colorList} uomList={uomList} sizeList={sizeList}
                        supplierId={supplierId} stockControlData={stockControlData} setInwardItemSelection={setInwardItemSelection}
                        itemPriceList={itemPriceList} headerOpen={headerOpen} movedToNextSaveNewRef={movedToNextSaveNewRef}
                        handlers={handlers}
                    />


                }

            </div>
        </>



    );
}

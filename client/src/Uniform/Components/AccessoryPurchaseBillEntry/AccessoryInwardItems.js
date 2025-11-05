import React, { useEffect, useState } from 'react';
import YarnDirectItem from './YarnDirectItem';
import Swal from 'sweetalert2';
import YarnPoItem from './AccessoryPoItem';
import TaxDetailsFullTemplate from '../TaxDetailsCompleteTemplate';
import Modal from '../../../UiComponents/Modal';

const YarnInwardItems = ({ inwardItems, setInwardItems, readOnly, billEntryId, supplierId, setInwardItemSelection, handleCloseContextMenu, contextMenu, handleDeleteRow , handleDeleteAllRows , handleRightClick, taxTemplateId, isSupplierOutside, hsnData }) => {


    const handleInputChange = (value, index, field) => {

        console.log()
        setInwardItems(inwardItems => {
            if (!inwardItems[index]) return inwardItems
            const newBlend = structuredClone(inwardItems);
            
            console.log(newBlend,"newBlend")

            // index = newBlend?.findIndex(v => v?.accessoryPoItemsId == "");
            // console.log(index, "index")


            // if (index !== -1) {
            //     newBlend[index][field] = value;
            // } else {
            //     newBlend[index]      = value;
            // }




            newBlend[index][field] = value;
            return newBlend
        });
    };


    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")



    useEffect(() => {
        if (inwardItems?.length >= 1) return
        setInwardItems(prev => {
            let newArray = Array?.from({ length: 1 - prev?.length }, () => {
                return {

                    colorId: "",
                    uomId: "",
                    accessoryPoItemsId: ""

                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setInwardItems, inwardItems])

    return (
        <>
            <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                <TaxDetailsFullTemplate readOnly={readOnly} setCurrentSelectedIndex={setCurrentSelectedIndex} taxTypeId={taxTemplateId} currentIndex={currentSelectedIndex} poItems={inwardItems} handleInputChange={handleInputChange} isSupplierOutside={isSupplierOutside} hsnData={hsnData?.data}
                />
            </Modal>

            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[200px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-medium text-slate-700">List Of Items</h2>
                    <div className="flex gap-2 items-center">

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
                            Fill Po Items
                        </button>
                    </div>

                </div>
                <div className={` relative w-full overflow-y-auto py-1`}>
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800">
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th
                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Po.No
                                </th>
                                <th

                                    className={`w-60 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Accessory Item
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Color
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM
                                </th>


                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Po Quantity
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Cancel Qty
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Already Inward Qty
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Already Return Qty
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Already Bill Qty
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Balance Qty
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    bill Qty
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Gross
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    View Tax
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Net Amount
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>{console.log(inwardItems, "inwardItemsinIndividual")}
                        <tbody className='overflow-y-auto  h-full w-full'>
                            {inwardItems?.map((item, index) =>
                                <>
                                    <YarnPoItem item={item} billEntryId={billEntryId}
                                        readOnly={readOnly} key={index} index={index} handleInputChange={handleInputChange} handleRightClick={handleRightClick} taxTemplateId={taxTemplateId}

                                        setCurrentSelectedIndex={setCurrentSelectedIndex}
                                    />

                                </>
                            )}

                        </tbody>
                    </table>
                </div>
                {contextMenu && (
                    <div
                        style={{
                            position: "absolute",
                            top: `${contextMenu.mouseY - 50}px`,
                            left: `${contextMenu.mouseX - 30}px`,

                            // background: "gray",
                            boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                            padding: "8px",
                            borderRadius: "4px",
                            zIndex: 1000,
                        }}
                        className="bg-gray-100"
                        onMouseLeave={handleCloseContextMenu} // Close when the mouse leaves
                    >
                        <div className="flex flex-col gap-1">
                            <button
                                className=" text-black text-[12px] text-left rounded px-1"
                                onClick={() => {
                                    handleDeleteRow(contextMenu.rowId, contextMenu.isPoItem);
                                    handleCloseContextMenu();
                                }}
                            // (item.isPoItem ? item.poItemsId : item.directItemsId, item?.isPoItem ? true : false)
                            >
                                Delete{" "}
                            </button>
                            <button
                                className=" text-black text-[12px] text-left rounded px-1"
                                onClick={() => {
                                    handleDeleteAllRows();
                                    handleCloseContextMenu();
                                }}
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default YarnInwardItems
import React from 'react'
import { substract } from '../../../Utils/helper'
import Modal from '../../../UiComponents/Modal';
import RawMaterialItem from './RawMaterialItem';
import { VIEW } from '../../../icons';
import FabricItemInwardReport from './FabricPoItemInwardReport';

const FabricPoItem = ({ index, id, item, rawMaterialType, dataObj, delivery }) => {
    const [currentProgramItemOpen, setCurrentProgramItemOpen] = React.useState("");
    const [inwardBreakUp, setInwardBreakUp] = React.useState(false);

    let programQty = item.qty;
    let inwardQty = item.alreadyInwardedQty;
    let balanceQty = substract(programQty, inwardQty);
    let alreadyBillQty = item.alreadyBillQty;
    let balBillQty = substract(inwardQty, item.alreadyBillQty)
    balBillQty = balBillQty > 0 ? balBillQty : 0
    return (
        <>
            <Modal isOpen={Number.isInteger(currentProgramItemOpen)} onClose={() => setCurrentProgramItemOpen("")}>
                <RawMaterialItem rawMaterialType={rawMaterialType} item={item} />
            </Modal>
            <Modal isOpen={inwardBreakUp} onClose={() => setInwardBreakUp(false)}>
                <FabricItemInwardReport dataObj={dataObj} rawMaterialType={rawMaterialType} item={item} inwardItems={item.ProcessInwardDetails} />
            </Modal>
            <tr key={id} className={`tx-table-row ${(currentProgramItemOpen === index) ? "border-2 border-black" : ""}`}>
                <td className='text-left px-1  tx-table-cell'>{index + 1}</td>
                <td className='text-left px-1 tx-table-cell'>{item?.Fabric?.aliasName}</td>
                <td className='text-left px-1 tx-table-cell'>{item?.Color?.name}</td>
                <td className='text-left px-1  tx-table-cell'>{item?.Design?.name}</td>
                <td className='text-right px-1  tx-table-cell'>{item?.Gauge?.name}</td>
                <td className='text-right px-1  tx-table-cell'>{item?.LoopLength?.name}</td>
                <td className='text-left px-1  tx-table-cell'>{item?.Gsm?.name}</td>
                <td className='text-right px-1  tx-table-cell'>{item?.KDia?.name}</td>
                <td className='text-right px-1  tx-table-cell'>{item?.FDia?.name}</td>
                <td className='text-left px-1  tx-table-cell'>{item?.Uom?.name}</td>
                <td className='text-right px-1 w-20 tx-table-cell'>{programQty}</td>
                <td className='text-right px-1 w-20 tx-table-cell' onClick={() => setInwardBreakUp(true)}>{inwardQty}</td>
                <td className='text-right px-1  tx-table-cell'>{balanceQty}</td>
                <td className='text-right   tx-table-cell'>{alreadyBillQty}</td>
                <td className='text-right   tx-table-cell'>{balBillQty}</td>
                <td className='text-center   tx-table-cell' onClick={() => setCurrentProgramItemOpen(index)}>{VIEW}</td>
            </tr>
        </>
    )
}

export default FabricPoItem

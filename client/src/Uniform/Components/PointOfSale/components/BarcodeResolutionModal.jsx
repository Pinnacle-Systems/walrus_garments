import React from 'react';
import Modal from '../../../../UiComponents/Modal';
import VarientsSelection from '../../StockTransfer/VarientsSelection';

const BarcodeResolutionModal = ({
    barcodeResolution,
    setBarcodeResolution
}) => {
    return (
        <Modal isOpen={barcodeResolution.open} widthClass="w-[90vw] max-w-5xl" onClose={() => {
            if (barcodeResolution.resolve) barcodeResolution.resolve(null);
            setBarcodeResolution({ open: false, matches: [], resolve: null });
        }}>
            <div className="h-[75vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col pt-3">
                <VarientsSelection
                    matches={barcodeResolution.matches}
                    title="Select Stock Row"
                    stockDrivenFields={[{ key: "location", label: "Location" }]}
                    onConfirm={(selectedItems) => {
                        if (barcodeResolution.resolve) barcodeResolution.resolve(selectedItems);
                        setBarcodeResolution({ open: false, matches: [], resolve: null });
                    }}
                />
            </div>
        </Modal>
    );
};

export default BarcodeResolutionModal;

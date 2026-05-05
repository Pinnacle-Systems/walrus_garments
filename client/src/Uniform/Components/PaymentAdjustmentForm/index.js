import { useState } from 'react';
import { FaPlus } from "react-icons/fa";
import PaymentAdjustmentFormContent from './Form';
import PaymentAdjustmentReport from './Report';

const PaymentAdjustmentForm = () => {
    const [showForm, setShowForm] = useState(false);
    const [id, setId] = useState("");

    const handleView = (viewId) => {
        setId(viewId);
        setShowForm(true);
    };

    const handleEdit = (editId) => {
        setId(editId);
        setShowForm(true);
    };

    const onNew = () => {
        setId("");
        setShowForm(true);
    };

    return (
        <>
            {showForm ? (
                <div className="h-[calc(100vh-5rem)] min-h-0 overflow-hidden">
                    <PaymentAdjustmentFormContent
                        id={id}
                        setId={setId}
                        onClose={() => setShowForm(false)}
                    />
                </div>
            ) : (
                <div className="flex h-[calc(100vh-5rem)] min-h-0 flex-col bg-[#F1F1F0]">
                    <div className="mb-2 flex shrink-0 flex-col items-start justify-between gap-x-4 rounded-tl-lg rounded-tr-lg border border-gray-200 bg-white px-1 py-0.5 shadow-sm sm:flex-row sm:items-center">
                        <h1 className="text-lg font-bold text-gray-800">
                            Payment Adjustments
                        </h1>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-2 py-1 rounded-md flex items-center gap-2 text-xs"
                            onClick={onNew}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-sm">
                        <PaymentAdjustmentReport
                            onView={handleView}
                            onEdit={handleEdit}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentAdjustmentForm;

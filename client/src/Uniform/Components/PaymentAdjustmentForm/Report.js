import React from 'react';
import { useGetPaymentAdjustmentQuery, useDeletePaymentAdjustmentMutation } from '../../../redux/services/PaymentAdjustmentService';
import { getCommonParams, getDateFromDateTimeToDisplay } from '../../../Utils/helper';
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import Swal from 'sweetalert2';

const PaymentAdjustmentReport = ({ onView, onEdit, onDelete }) => {
    const { branchId, finYearId } = getCommonParams();
    const { data, isLoading, refetch } = useGetPaymentAdjustmentQuery({ branchId, finYearId });
    const [deleteAdjustment] = useDeletePaymentAdjustmentMutation();

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteAdjustment(id).unwrap();
                Swal.fire('Deleted!', 'Payment Adjustment has been deleted.', 'success');
                refetch();
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete adjustment.', 'error');
            }
        }
    };

    const columns = [
        { header: 'S.No', accessor: (row, index) => index + 1, width: 'w-12' },
        { header: 'Date', accessor: (row) => getDateFromDateTimeToDisplay(row.date), width: 'w-32' },
        { header: 'Adjustment No', accessor: 'docId', width: 'w-48' },
        { header: 'Ref No', accessor: 'paymentRefNo', width: 'w-40' },
        { header: 'Type', accessor: (row) => (
            <span className={row.transactionType === 'PLUS' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {row.transactionType}
            </span>
        ), width: 'w-24' },
        { header: 'Amount', accessor: (row) => row.paidAmount.toLocaleString(), width: 'w-32', align: 'text-right' },
        { header: 'Mode', accessor: 'paymentMode', width: 'w-32' },
        { header: 'Reason', accessor: 'transaction', width: 'w-64' },
        {
            header: 'Actions',
            accessor: (row) => (
                <div className="flex gap-2 justify-center">
                    <button onClick={() => onView(row.id)} className="text-blue-500 hover:text-blue-700" title="View">
                        <FiEye size={16} />
                    </button>
                    <button onClick={() => onEdit(row.id)} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                        <FiEdit size={16} />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700" title="Delete">
                        <FiTrash2 size={16} />
                    </button>
                </div>
            ),
            width: 'w-24'
        }
    ];

    return (
        <div className="h-full flex flex-col">
            <CommonTable
                columns={columns}
                data={data?.data || []}
                isLoading={isLoading}
            />
        </div>
    );
};

export default PaymentAdjustmentReport;

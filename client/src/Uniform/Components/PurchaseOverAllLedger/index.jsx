import React from 'react'
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService'
import { useState } from 'react';
import { VIEW } from '../../../icons';
import { useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';

const PaymentOutStandingLedger = () => {
    const [searchPartyName, setSearchPartyName] = useState('');
    const { data } = useGetPartyQuery({ params: { isPaymentOutstanding: true, searchValue: searchPartyName } });
    const partyList = data?.data?.filter(i => !i.isB2C && i.isClient) || [];
    const dispatch = useDispatch();
    return (
        <div className={` relative w-full overflow-y-auto mx-auto py-1`}>
            <div className="flex items-center justify-between bg-white px-3  mb-2 rounded-lg shadow border border-gray-200">
                <h1 className="text-xl font-semibold text-gray-800">
                    Payment Outstanding Ledger
                </h1>

            </div>
            <div className="h-[78vh] overflow-y-auto bg-white">

                <table className=" border border-gray-500 text-sm table-auto w-[80%]  mx-auto">
                    <thead className='top-0'>
                        <tr className='page-heading text-white'>
                            <th className="table-data w-2 text-center p-0.5">S.no</th>
                            <th className="table-data w-44">
                                <div className='grid'>
                                    <span>Customer</span>
                                    <input type="text" className='focus:outline-none rounded-md text-gray-700' value={searchPartyName}
                                        onChange={(e) => { setSearchPartyName(e.target.value) }} />
                                </div>
                            </th>
                            <th className="table-data w-5">Outstanding Balance</th>
                            <th className="table-data w-5">View</th>
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto h-full w-full'>
                        {partyList.map((party, index) =>
                            <tr className="w-full table-row p-1">
                                <td className="table-data text-center px-1 py-1">
                                    {index + 1}
                                </td>
                                <td className="table-data text-left px-1 py-1 text-[12px]">
                                    {party.name}
                                </td>

                                <td className="table-data">
                                    <div className='flex items-center justify-center'>
                                        {party?.outstandingBalance}
                                    </div>
                                </td>
                                <td className="table-data">
                                    <div className='flex items-center justify-center' onClick={() => {
                                        dispatch(push({
                                            name: "LEDGER",
                                            projectId: party.id
                                        }))
                                    }}>
                                        {VIEW}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default PaymentOutStandingLedger

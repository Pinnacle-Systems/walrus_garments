import React, { useEffect, useState } from 'react'
import { DropdownInputNew, ReusableSearchableInputNewCustomerwithBranches, TextInput, TextInputNew } from '../../../Inputs';
import { GenerateButton } from '../../../Buttons';
import Modal from '../../../UiComponents/Modal';
import tw from '../../../Utils/tailwind-react-pdf';
import { PDFViewer } from '@react-pdf/renderer';
import LedgerReportPrintFormat from './PrintFormat';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import { getCommonParams } from '../../../Utils/helper';
import { useGetBranchByIdQuery } from '../../../redux/services/BranchMasterService';
import { FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useGetFinYearByIdQuery } from '../../../redux/services/FinYearMasterService';
import { dropDownListObject } from '../../../Utils/contructObject';


const Ledger = () => {
    const openTabs = useSelector((state) => state.openTabs);
    const { token, ...params } = getCommonParams();

    const currentDate = moment(new Date()).format("YYYY-MM-DD");
    const [partyId, setPartyId] = useState('');
    const [startDate, setStartDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(currentDate);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const { data } = useGetPartyQuery({ params: { isPartyLedgerReport: true, partyId, startDate, endDate } }, { skip: !partyId || !startDate || !endDate })

    const { data: customerList } = useGetPartyQuery({ params: { ...params } });
    const { branchId, finYearId } = getCommonParams()
    const { data: partyList } = useGetPartyQuery({ params: { ...params } });

    const { data: branchData } = useGetBranchByIdQuery(branchId, { skip: !branchId });
    const { data: finYearData } = useGetFinYearByIdQuery(finYearId, { skip: !finYearId });


    console.log(openTabs.tabs.find(i => i.name === "LEDGER"), "finYearData")

    const ledgerData = data?.data;
    const dispatch = useDispatch();


    useEffect(() => {
        const currentTabPreviewId = openTabs.tabs.find(i => i.name === "LEDGER")?.projectId
        const currentTabPreviewDate = openTabs.tabs.find(i => i.name === "LEDGER")?.date || new Date()

        console.log(openTabs.tabs.find(i => i.name === "LEDGER"), "currentTabPreviewDate", currentTabPreviewId)
        if (!currentTabPreviewId) return
        setPartyId(currentTabPreviewId);
        setStartDate(moment(currentTabPreviewDate).startOf('month').format("YYYY-MM-DD"))
        setEndDate(moment(currentTabPreviewDate).format("YYYY-MM-DD"))
        dispatch(push({
            name: "LEDGER",
            previewId: null
        }))
    }, [openTabs, dispatch])
    console.log(ledgerData, "ledgerData")
    return (
        <>
            <Modal isOpen={printModalOpen} onClose={() => setPrintModalOpen(false)} widthClass={"w-[90%] h-[90%]"} >
                <PDFViewer style={tw("w-full h-full")} >
                    <LedgerReportPrintFormat ledgerData={ledgerData} startDate={startDate} endDate={endDate} partyId={partyId} partyData={partyList?.data} branchData={branchData?.data} />
                </PDFViewer>
            </Modal>
            <div
                id="registrationFormReport"
                className="flex flex-col w-full h-[95%] text-sm"
            >
                {/* Header */}
                <div className="flex items-center justify-between bg-white px-3  mb-2 rounded-lg shadow border border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Ledger
                    </h1>
                    <button
                        className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4  rounded-md flex items-center gap-2 text-sm"
                        onClick={() => {
                            setStartDate("")
                            setEndDate("")
                            setPartyId('')
                        }}
                    >
                        <FaPlus />  New
                    </button>
                </div>

                {/* Parameters */}
                <fieldset className="border border-gray-300 rounded-md bg-white px-3 py-2">
                    <legend className="px-2 text-xs font-semibold text-gray-600">
                        Parameters
                    </legend>

                    <div className="grid grid-cols-1 sm:grid-cols-8 gap-2  rounded">
                        {/* Customer */}
                        {/* <div className="sm:col-span-2">
                            <PartyDropdownSearchCus
                                name="Customer"
                                selected={partyId}
                                setSelected={setPartyId}
                                required={true}
                            />
                        </div> */}

                        {/* <div className='col-span-3'>

                            <ReusableSearchableInputNewCustomerwithBranches
                                label="Customer Name"
                                component="PartyMaster"
                                placeholder="Search Customer Name..."
                                // optionList={supplierList?.data}
                                setSearchTerm={(value) => { setPartyId(value) }}
                                searchTerm={partyId}
                                show={"isClient"}
                                required={true}

                            />
                        </div> */}

                        <div className="col-span-2">
                            <DropdownInputNew
                                name="Customer"
                                options={dropDownListObject(
                                    customerList?.data?.filter(item => item.active),
                                    "name",
                                    "id"
                                )}
                                value={partyId}
                                setValue={setPartyId}

                            />
                        </div>

                        {/* Start Date */}
                        <TextInputNew
                            name="Start Date"
                            value={startDate}
                            setValue={setStartDate}
                            type="date"
                            required
                        />

                        {/* End Date */}
                        <TextInputNew
                            name="End Date"
                            value={endDate}
                            setValue={setEndDate}
                            type="date"
                            required
                        />

                        {/* Generate Button */}
                        <div className="flex items-end">
                            <GenerateButton
                                color="text-green-600"
                                onClick={() => {
                                    if (!partyId) {
                                        return Swal.fire({
                                            icon: 'warning',
                                            title: 'Select Customer',
                                            showConfirmButton: false,
                                        });
                                    }

                                    if (!startDate) {
                                        return Swal.fire({
                                            icon: 'warning',
                                            title: 'Select Start Date',
                                            showConfirmButton: false,
                                        });
                                    }

                                    if (!endDate) {
                                        return Swal.fire({
                                            icon: 'warning',
                                            title: 'Select End Date',
                                            showConfirmButton: false,
                                        });
                                    }

                                    setPrintModalOpen(true);
                                }}
                            />
                        </div>

                    </div>
                </fieldset>
            </div>

        </>
    )
}

export default Ledger

import React from 'react'
import { useEffect, useState } from "react";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService"
import { Loader } from "../../../Basic/components";
import { showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import { findFromList, getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import { useGetQuotesQuery } from '../../../redux/services/QuotesService';
import { useGetInvoiceQuery } from '../../../redux/services/InvoiceService';
import { useGetProjectQuery } from '../../../redux/services/ProjectService';
import { TablePagination } from '@mui/material';

const InvoiceBillForm = ({
    onClick,
}) => {
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const [searchDocId, setSearchDocId] = useState("");
    const [searchBillDate, setSearchBillDate] = useState("");
    const [searchSupplierDcNo, setSearchSupplierDcNo] = useState("");

    const [searchSupplierName, setSearchSupplierName] = useState("");

    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [searchValidDate, setSearchValidDate] = useState("")
    const [searchProjectId, setSearchProjectId] = useState("")
    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }
    const searchFields = { searchDocId, searchBillDate, searchSupplierName, searchProjectId }

    useEffect(() => { setCurrentPageNumber(1) }, [dataPerPage, searchDocId, searchBillDate, searchSupplierName, searchProjectId])

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const params = {
        branchId, companyId
    };

    const { data: projectData } = useGetProjectQuery({ params: { branchId } });

    const { data: allData, isLoading, isFetching } = useGetInvoiceQuery({ params: { branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber } });

    const { data: supplierList, isLoading: isSupplierLoading, isFetching: isSupplierFetching } =
        useGetPartyQuery({ params: { ...params } });

    useEffect(() => {
        if (allData?.totalCount) {
            setTotalCount(allData?.totalCount)
        }
    }, [allData, isLoading, isFetching])

    const handleChange = (event, value) => {
        setCurrentPageNumber(value);
      };
      const handleChangeRowsPerPage = (event) => {
        setDataPerPage(parseInt(event.target.value, 10));
        setCurrentPageNumber(0);
      };

    const isLoadingIndicator = isLoading || isFetching || isSupplierFetching || isSupplierLoading


    return (
        <div id='registrationFormReport' className="flex flex-col w-full h-[95%] overflow-auto">
            <div className="md:flex md:items-center md:justify-between page-heading p-1">
                <div className="heading text-center md:mx-10">Invoice List </div>
                <div className=" sub-heading justify-center md:justify-start items-center">
                    <label className="text-white text-sm rounded-md m-1  border-none">Show Entries</label>
                    <select value={dataPerPage}
                        onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded mr-9'>
                        {showEntries.map((option, index) => <option key={index} value={option.value} >{option.show}</option>)}
                    </select>
                </div>
            </div>
            <>
                <div
                    className="h-[500px] overflow-auto"
                >
                    <table className="table-fixed text-center w-full">
                        <thead className="border-2 table-header">
                            <tr className='h-2'>
                                <th
                                    className="border-2  top-0 stick-bg w-10"
                                >
                                    S. no.
                                </th>
                                <th
                                    className="border-2  top-0 stick-bg flex flex-col"
                                >
                                    <div>Invoice. No</div><input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchDocId}
                                        onChange={(e) => {
                                            setSearchDocId(e.target.value);
                                        }}
                                    />
                                </th>
                                <th
                                    className="border-2  top-0 stick-bg"
                                >
                                    <div>Invoice. Date</div><input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchBillDate}
                                        onChange={(e) => {
                                            setSearchBillDate(e.target.value);
                                        }}
                                    />
                                </th>
                                <th

                                    className="border-2  top-0 stick-bg flex flex-col"
                                >
                                    <div>Client</div><input
                                        type="text"
                                        className="text-black  h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchSupplierName}
                                        onChange={(e) => {
                                            setSearchSupplierName(e.target.value);
                                        }}
                                    />
                                </th>


                                <th
                                    className="border-2  top-0 stick-bg"
                                >
                                    <div>Project</div><input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchProjectId}
                                        onChange={(e) => {
                                            setSearchProjectId(e.target.value);
                                        }}
                                    />
                                </th>


                            </tr>
                        </thead>
                        {isLoadingIndicator ?
                            <tbody>
                                <tr>
                                    <td>
                                        <Loader />
                                    </td>
                                </tr>
                            </tbody>
                            :
                            <tbody className="border-2">{console.log(allData, "all")}
                                {(allData?.data ? allData?.data : []).map((dataObj, index) => (
                                    <tr
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                // onClick(dataObj.id);
                                            }
                                        }}
                                        tabIndex={0}
                                        key={dataObj.id}
                                        className="border-2 tx-table-row cursor-pointer"
                                        onClick={() => onClick(dataObj.id)}>
                                        <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                                        <td className='py-1'> {dataObj.docId}</td>
                                        <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.createdAt)} </td>
                                        <td className='py-1'>{findFromList(dataObj.clientId, supplierList.data, "name")}</td>

                                        <td className='py-1'>{findFromList(dataObj?.projectId, projectData?.data, "docId")}</td>

                                    </tr>
                                ))}
                            </tbody>
                        }
                    </table>
                </div>
            </>
           <TablePagination
           component="div"
           count={totalCount}
           page={currentPageNumber - 1}
           onPageChange={(e,value)=>{handleChange(e,value + 1)}}
           rowsPerPage={dataPerPage}
           onRowsPerPageChange={handleChangeRowsPerPage}
            // previousLabel={"<"}
            // nextLabel={">"}
            // breakLabel={"..."}
            // forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
            // pageCount={Math.ceil(totalCount / dataPerPage)}
            // marginPagesDisplayed={1}
            // onPageChange={handleOnclick}
            // containerClassName="flex space-x-2 py-2"
            // pageClassName="border border-gray-300 rounded px-3 py-1 bg-sky-800 hover:bg-blue-700 transition duration-200"
            // breakClassName="border border-gray-300 rounded px-3 py-1 text-gray-500 bg-gray-50"
            // disabledClassName="p-1 bg-gray-200 text-gray-500 cursor-not-allowed"
            // previousLinkClassName="border border-gray-300 rounded px-3 py-1 bg-white hover:bg-blue-700 transition duration-200"
            // nextLinkClassName="border border-gray-300 rounded px-3 py-1 bg-white hover:bg-blue-700 transition duration-200"
            // activeClassName="bg-blue-500 text-white border border-blue-500 rounded px-3 py-1"
          />
        </div>
    )
}

export default InvoiceBillForm
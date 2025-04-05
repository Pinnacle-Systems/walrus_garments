import React from 'react'
import { useEffect, useState } from "react";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService"
import { Loader } from "../../../Basic/components";
import { showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import { findFromList, getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';


import { useGetPurchaseBillQuery } from '../../../redux/services/PurchaseBillService';
import { useGetQuotesQuery } from '../../../redux/services/QuotesService';
import { useGetLeadQuery } from '../../../redux/services/LeadFormService';


const LeadPageFormReport = ({
  onClick,
}) => {
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )
  const [searchDocId, setSearchDocId] = useState("");
  const [searchBillDate, setSearchBillDate] = useState("");


  const [searchClientName, setSearchClientName] = useState("");

  const [dataPerPage, setDataPerPage] = useState("10");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [searchLocation, setSearchLocation] = useState("")
  const [searchContact, setSearchContact] = useState("")
  const handleOnclick = (e) => {
    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
  }
  const searchFields = { searchDocId, searchBillDate, searchClientName, searchLocation, searchContact }

  useEffect(() => { setCurrentPageNumber(1) }, [dataPerPage, searchDocId, searchBillDate, searchClientName, searchLocation, searchContact])

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )
  const params = {
    branchId, companyId
  };


  const { data: allData, isLoading, isFetching } = useGetLeadQuery({ params: { branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber } });




  const { data: supplierList, isLoading: isSupplierLoading, isFetching: isSupplierFetching } =
    useGetPartyQuery({ params: { ...params } });

  useEffect(() => {
    if (allData?.totalCount) {
      setTotalCount(allData?.totalCount)
    }
  }, [allData, isLoading, isFetching])



  const isLoadingIndicator = isLoading || isFetching || isSupplierFetching || isSupplierLoading


  return (
    <div id='registrationFormReport' className="flex flex-col w-full h-[95%] overflow-auto">
      <div className="md:flex md:items-center md:justify-between page-heading p-1">
        <div className="heading text-center md:mx-10">Lead Report </div>
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
                  <div>Lead. No</div><input
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
                  <div>Lead.Date</div><input
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
                  <div>C.Name</div><input
                    type="text"
                    className="text-black  h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchClientName}
                    onChange={(e) => {
                      setSearchClientName(e.target.value);
                    }}
                  />
                </th>


                <th
                  className="border-2  top-0 stick-bg"
                >
                  <div>Location</div><input
                    type="text"
                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchLocation}
                    onChange={(e) => {
                      setSearchLocation(e.target.value);
                    }}
                  />
                </th>

                <th
                  className="border-2  top-0 stick-bg"
                >
                  <div>Contact</div><input
                    type="text"
                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchContact}
                    onChange={(e) => {
                      setSearchContact(e.target.value);
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
              <tbody className="border-2">
                {(allData?.data ? allData?.data : []).map((dataObj, index) => (
                  <tr
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onClick(dataObj.id);
                      }
                    }}
                    tabIndex={0}
                    key={dataObj.id}
                    className="border-2 table-row cursor-pointer"
                    onClick={() => onClick(dataObj.id)}>
                    <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                    <td className='py-1'> {dataObj.docId}</td>
                    <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.createdAt)} </td>
                    <td className='py-1'>{dataObj?.Party?.name}</td>

                    <td className='py-1'>{dataObj.location}</td>
                    <td className='py-1'>{dataObj.contact}</td>

                  </tr>
                ))}
              </tbody>
            }
          </table>
        </div>
      </>
      <ReactPaginate
        previousdiv={"<"}
        nextdiv={">"}
        breakdiv={"..."}
        breakClassName={"break-me"}
        forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
        pageCount={Math.ceil(totalCount / dataPerPage)}
        marginPagesDisplayed={1}
        onPageChange={handleOnclick}
        containerClassName={"flex justify-center m-2 gap-5 items-center"}
        pageClassName={"border custom-circle text-center"}
        disabledClassName={"p-1 bg-gray-200"}
        previousLinkClassName={"border p-1 text-center"}
        nextLinkClassName={"border p-1"}
        activeClassName={"bg-blue-900 text-white px-2"} />
    </div>
  )
}

export default LeadPageFormReport
import React from 'react'
import { useEffect, useState } from "react";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService"
import { Loader } from "../../../Basic/components";
import { showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import { findFromList, getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber, substract } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';


import { useGetQuotesQuery } from '../../../redux/services/QuotesService';
import { AddNewButton } from '../../../Buttons';


const QuotesBillForm = ({
  onClick, onNew, onNewButton
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
  const handleOnclick = (e) => {
    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
  }
  const searchFields = { searchDocId, searchBillDate, searchSupplierName, searchValidDate }

  useEffect(() => { setCurrentPageNumber(1) }, [dataPerPage, searchDocId, searchBillDate, searchSupplierName, searchValidDate])

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )
  const params = {
    branchId, companyId
  };


  const { data: allData, isLoading, isFetching } = useGetQuotesQuery({ params: { branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber } });

  const { data: supplierList, isLoading: isSupplierLoading, isFetching: isSupplierFetching } =
    useGetPartyQuery({ params: { ...params } });

  useEffect(() => {
    if (allData?.totalCount) {
      setTotalCount(allData?.totalCount)
    }
  }, [allData, isLoading, isFetching])


  function findTotalAmount(id) {

    let quoteVersion = allData?.data.find(item => parseInt(item.id) === parseInt(id))?.quoteVersion
    let transportCost = allData?.data.find(item => parseInt(item.id) === parseInt(id))?.transportCost
    let quotesItems = allData?.data.find(item => parseInt(item.id) === parseInt(id))?.QuotesItems



    let totalCost;

    totalCost = quotesItems?.filter(item => item.quoteVersion == quoteVersion)


    totalCost = totalCost?.reduce((a, b, index) => a + ((substract(parseFloat(b.qty) * parseFloat(b.price), parseFloat(b?.discount || 0))) + ((parseFloat(b.qty) * parseFloat(b.price)) * ((b.taxPercent ? b.taxPercent.replace("%", "") : 0) / 100))), 0)

    totalCost = totalCost + parseInt(transportCost || 0)

    return totalCost
  }

  //   useEffect(() => {
  //     let registrationFormReportComponent = document.getElementById("registrationFormReport");
  //     registrationFormReportComponent.addEventListener('keydown', function (ev) {
  //       var focusableElementsString = '[tabindex="0"]';
  //       let ol = document.querySelectorAll(focusableElementsString);
  //       if (ev.key === "ArrowDown") {
  //         for (let i = 0; i < ol.length; i++) {
  //           if (ol[i] === ev.target) {
  //             let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
  //             o.focus(); break;
  //           }
  //         }
  //         ev.preventDefault();
  //       } else if (ev.key === "ArrowUp") {
  //         for (let i = 0; i < ol.length; i++) {
  //           if (ol[i] === ev.target) {
  //             let o = ol[i - 1];
  //             o.focus(); break;
  //           }
  //         }
  //         ev.preventDefault();
  //       }
  //     });
  //     return () => {
  //       registrationFormReportComponent.removeEventListener('keydown', () => { });
  //     };
  //   }, []);




  return (
    <div id='registrationFormReport' className="flex flex-col w-full h-[95%] overflow-auto">
      <div className="md:flex md:items-center md:justify-between page-heading p-1">
        <div className="heading text-center md:mx-10">Quotes List </div>
        <div className=" sub-heading justify-center md:justify-start items-center">
          {
            onNewButton ? <AddNewButton onClick={onNew} /> : <div></div>
          }
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
                  S. no
                </th>
                <th
                  className="border-2  top-0 stick-bg flex flex-col"
                >
                  <div>Quotes. No</div><input
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
                  <div>Quotes. Date</div><input
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
                  <div>Valid.Until.Date</div><input
                    type="text"
                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchValidDate}
                    onChange={(e) => {
                      setSearchValidDate(e.target.value);
                    }}
                  />
                </th>
                <th
                  className="border-2  top-0 stick-bg"
                >
                  Amount
                </th>


              </tr>
            </thead>

            <tbody className="border-2">
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
                  <td className='py-1 h-9'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                  <td className='py-1'> {dataObj.docId}</td>
                  <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.createdAt)} </td>
                  <td className='py-1'>{findFromList(dataObj.clientId, supplierList?.data, "name")}</td>

                  <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.validDate)}</td>
                  <td className='py-1'>{parseFloat(findTotalAmount(dataObj.id)).toFixed(2)}</td>

                </tr>
              ))}
            </tbody>

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

export default QuotesBillForm
import React from 'react'
import { Fragment, useMemo, useRef } from 'react'

import { useEffect, useState } from "react";
import { Loader } from "../../../Basic/components";
import { showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import { getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import { useGetProjectQuery } from '../../../redux/services/ProjectService';
import moment from 'moment';
import { TablePagination } from '@mui/material';


const NotificationReport = ({
    onClick, setQuotesUpdate
}) => {
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const [searchDocId, setSearchDocId] = useState("");
    const [currentOpenNumber, setCurrentOpenNumber] = useState("");

    const [searchDocDate, setSearchDocDate] = useState("");
    const [searchPartyName, setSearchPartyName] = useState("");

    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [searchLocation, setSearchLocation] = useState("")
    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }
    const searchFields = { searchDocId, searchDocDate, searchPartyName }

    useEffect(() => { setCurrentPageNumber(1) }, [dataPerPage, searchDocId, searchDocDate, searchPartyName, searchLocation])


    const { data: allData, isLoading, isFetching } = useGetProjectQuery({ params: { branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber, getNotification: true } });


    useEffect(() => {
        if (allData?.totalCount) {
            setTotalCount(allData?.totalCount)
        }
    }, [allData, isLoading, isFetching])


    function getBorderColor(projectDatas) {

        let borderColor = projectDatas.filter(val => val.token === "bg-red-300")
        if (borderColor?.length > 0) {
            return true
        }
        return false

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

    const isLoadingIndicator = isLoading || isFetching;


    return (
        <div id='registrationFormReport' className="flex flex-col w-full h-[95%] overflow-auto">
            <div className="md:flex md:items-center md:justify-between page-heading p-1">
                <div className="heading text-center md:mx-10">Project Alert </div>
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
                    className="h-[500px] overflow-auto w-full"
                >
                    <table className="table-fixed text-center w-screen ">
                        <thead className="border-2 table-header">
                            <tr className='h-2'>
                                <th
                                    className="border-t-2 border-r-2  top-0 stick-bg w-10"
                                >
                                    S. no.
                                </th>
                                <th
                                    className="border-t-2 border-r-2  top-0 stick-bg flex flex-col"
                                >
                                    <div>Doc. Id</div><input
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
                                    className=" border-t-2 border-r-2  top-0 stick-bg"
                                >
                                    <div>Doc. Date</div><input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchDocDate}
                                        onChange={(e) => {
                                            setSearchDocDate(e.target.value);
                                        }}
                                    />
                                </th>
                                <th

                                    className="border-t-2 border-r-2  top-0 stick-bg flex flex-col"
                                >
                                    <div>Client</div><input
                                        type="text"
                                        className="text-black  h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchPartyName}
                                        onChange={(e) => {
                                            setSearchPartyName(e.target.value);
                                        }}
                                    />
                                </th>


                                <th
                                    className="border-t-2 border-r-2 top-0 stick-bg"
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
                            <tbody className="border-2 w-full">
                                {(allData?.data ? allData?.data : []).map((dataObj, index) => (
                                    <Fragment key={index}  >
                                        <tr
                                            className={`text-xs border border-gray-200 cursor-pointer text-white ${(getBorderColor(dataObj?.projectDatas)) ? "bg-red-400" : "bg-yellow-400"}`}


                                            onClick={() => {
                                                if (index === currentOpenNumber) {
                                                    setCurrentOpenNumber("")
                                                } else {
                                                    setCurrentOpenNumber(index)

                                                }
                                            }}>
                                            <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                                            <td className='py-1'> {dataObj.projectDocId}</td>
                                            <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.createdAt)} </td>
                                            <td className='py-1'>{dataObj?.clientName}</td>
                                            <td className='py-1'>{dataObj?.location}</td>

                                        </tr>

                                        {(currentOpenNumber === index)
                                            &&

                                            <table class=" border w-screen table-fixed text-xs mt-2">
                                                <thead className=" table-header">
                                                    <tr className='h-2'>
                                                        <th
                                                            className="w-7 top-0 stick-bg">
                                                            S.no.
                                                        </th>
                                                        <th
                                                            className="w-44  top-0 stick-bg table-data "
                                                        >
                                                            Sub.LineItems.Name

                                                        </th>
                                                        <th
                                                            className="w-60  top-0 stick-bg table-data "
                                                        >
                                                            Description

                                                        </th>
                                                        <th
                                                            className="w-20 top-0 stick-bg table-data">
                                                            Category
                                                        </th>
                                                        <th
                                                            className="w-24  top-0 stick-bg ">
                                                            ResponsiblePerson
                                                        </th>
                                                        <th className="w-24  top-0 stick-bg table-data">
                                                            PlanStartDate
                                                        </th>

                                                        <th
                                                            className=" w-20  top-0 stick-bg table-data "
                                                        >
                                                            LeadDays

                                                        </th>
                                                        <th className="w-20 top-0 stick-bg table-data">
                                                            PlanEndDate
                                                        </th>

                                                    </tr>
                                                </thead>
                                                <tbody >
                                                    {(dataObj.projectDatas ? dataObj.projectDatas : []).map((item, itemIndex) => (
                                                        <tr key={itemIndex} className={` ${item?.token} w-full`}>
                                                            <td className='border-2 border-gray-400 p-1'>{itemIndex + 1}</td>
                                                            <td className='border-2 border-gray-400'>{item?.name ? item?.name : ""}</td>
                                                            <td className='border-2 border-gray-400'>{item?.description ? item?.description : ""}</td>
                                                            <td className='border-2 border-gray-400'>{item?.category ? item?.category : ""}</td>
                                                            <td className='border-2 border-gray-400'>{item?.responsiblePerson ? item?.responsiblePerson : ""}</td>
                                                            <td className='px-1 text-right border-2 border-gray-400'>{item?.planStartDate ? moment(item?.planStartDate).format("DD-MM-YYYY") : 0}</td>
                                                            <td className='px-1 text-right border-2 border-gray-400'>{item?.leadDays || 0}</td>
                                                            <td className='px-1 text-right border-2 border-gray-400'>{item?.planEndDate ? moment(item?.planEndDate).format("DD-MM-YYYY") : 0}</td>

                                                        </tr>
                                                    ))}



                                                </tbody>
                                            </table>
                                        }
                                    </Fragment>




















                                ))}
                            </tbody>
                        }
                    </table>
                </div>
            </>
          
        </div>
    )
}

export default NotificationReport
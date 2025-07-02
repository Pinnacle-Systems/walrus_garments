import React, { useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { Loader } from '../../../Basic/components';
import { useGetPoItemsQuery } from '../../../redux/uniformService/PoServices';
import { showEntries } from '../../../Utils/DropdownData';
import ReactPaginate from 'react-paginate';
import { getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';


const YarnPoItemSelection = ({ poType, supplierId, isItemAdded, handleChange, getSelectAll, handleSelectAllChange }) => {
    const [poNo, setPoNo] = useState("");
    const [searchPoDate, setPoDate] = useState("");
    const [searchDueDate, setDueDate] = useState("");
    const [searchPoType, setSearchPoType] = useState("");
    const [supplier, setSupplier] = useState("");
    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }
    const searchFields = { searchDocId: poNo, searchPoDate, searchSupplierAliasName: supplier, searchPoType, searchDueDate }

    const { data: poItems, isLoading: isPoItemsLoading, isFetching: isPoItemsFetching } = useGetPoItemsQuery({
        params: {
            branchId, supplierId, poType, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber,
            isPurchaseInwardFilter: true
        }
    })


    useEffect(() => {
        if (poItems?.totalCount) {
            setTotalCount(poItems?.totalCount)
        }
    }, [poItems, isPoItemsFetching, isPoItemsLoading])

    const isLoadingIndicator = isPoItemsFetching || isPoItemsLoading
    return (
        <div className="flex flex-col w-full h-[80%]">
            <div className=" w-full flex justify-around  bg-gray-700 p-1">
                <div className=" text-white ml-5"> Purchase Order Items </div>
                <div className="  ml-20">
                    <label className="text-white text-sm rounded-md m-1  border-none">Show Entries</label>
                    <select value={dataPerPage}
                        onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded mr-9'>
                        {showEntries.map((option) => <option value={option.value} >{option.show}</option>)}
                    </select>
                </div>
            </div>
            <>
                <div
                    className="min-h-[400px]"
                >
                    <table className=" text-center w-full table-fixed">
                        <thead className="border-2 table-header">
                            <tr className='h-2'>
                                <th className='w-7'>
                                    <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, poItems?.data ? poItems.data : [])}
                                        checked={getSelectAll(poItems?.data ? poItems.data : [])}
                                    />
                                </th>
                                <th
                                    className="border-2  top-0 stick-bg w-12">
                                    S. no.
                                </th>
                                <th
                                    className="border-2  top-0 stick-bg w-48"
                                >
                                    <label>Po.No</label>
                                    <input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={poNo}
                                        onChange={(e) => {
                                            setPoNo(e.target.value);
                                        }}
                                    />
                                </th>
                                <th
                                    className="border-2  top-0 stick-bg"
                                >
                                    <label>Po.Date</label>

                                </th>
                                <th className="border-2  top-0 stick-bg">
                                    <label>Fabric</label>
                                    {/* <input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchDueDate}
                                        onChange={(e) => {
                                            setDueDate(e.target.value);
                                        }}
                                    /> */}
                                </th>
                                <th className="border-2  top-0 stick-bg">
                                    <label>Color</label>

                                </th>
                                <th className="border-2  top-0 stick-bg">
                                    <label>Design</label>

                                </th>
                                <th className="border-2  top-0 stick-bg">
                                    <label>Gauge</label>

                                </th>
                                <th className="border-2  top-0 stick-bg">
                                    <label>LL</label>

                                </th>
                                <th className="border-2  top-0 stick-bg">
                                    <label>GSM</label>

                                </th>
                                <th className="border-2  top-0 stick-bg">
                                    <label>K-Dia</label>

                                </th>
                                <th className="border-2  top-0 stick-bg">
                                    <label>F-Dia</label>

                                </th>
                                <th className="border-2  top-0 stick-bg">
                                    <label>Uom</label>

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
                                {poItems?.data?.filter(val => val.balanceQty !== 0)?.map((dataObj, index) => (
                                    <tr
                                        key={dataObj.id}
                                        className="border-2 table-row "
                                        onClick={() => handleChange(dataObj.id)}
                                    >
                                        <td className='py-1'>
                                            <input type="checkbox" name="" id="" checked={isItemAdded(dataObj.id)} />
                                        </td>
                                        <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                                        <td className='py-1'> {dataObj.Po.docId}</td>
                                        <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.Po.createdAt)} </td>
                                        <td className='py-1'> {dataObj.Fabric.name}</td>
                                        <td className='py-1'> {dataObj.Color.name}</td>
                                        <td className='py-1'> {dataObj.Design.name}</td>
                                        <td className='py-1'> {dataObj.Gauge.name}</td>
                                        <td className='py-1'> {dataObj.LoopLength.name}</td>
                                        <td className='py-1'> {dataObj.Gsm.name}</td>
                                        <td className='py-1'> {dataObj.KDia.name}</td>
                                        <td className='py-1'> {dataObj.FDia.name}</td>
                                        <td className='py-1'> {dataObj.Uom.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        }
                    </table>
                </div>
            </>
            <ReactPaginate
                previousLabel={"<"}
                nextLabel={">"}
                breakLabel={"..."}
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

export default YarnPoItemSelection
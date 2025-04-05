import React, { useState } from 'react'
import { DateInput, MultiSelectDropdown } from '../../../Inputs';
import secureLocalStorage from 'react-secure-storage';
import { EMPTY_ICON } from "../../../icons";
import { useGetPurchaseBillQuery } from '../../../redux/services/PurchaseBillService';
import moment from 'moment';
import { Loader } from '../../../Basic/components';
import { getDateFromDateTimeToDisplay, sumArray } from '../../../Utils/helper';
import { multiSelectOption } from '../../../Utils/contructObject';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { ExcelButton, PreviewButtonOnly } from '../../../Buttons';
import { exportFileToCsv } from '../../../Utils/excelHelper';
import MonthlyPurchaseDocument from './MonthlyPurchaseDocument';
import Modal from '../../../UiComponents/Modal';
import { PDFViewer } from '@react-pdf/renderer';



const MonthlyPurchase = () => {
  const [startDate, setStartDate] = useState("")
  const [openPdfView, setOpenPdfView] = useState(false);

  const [endDate, setEndDate] = useState("")
  const [partyList, setPartyList] = useState([]);

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )
  const params = {
    branchId, companyId, filterSupplier: true
  };


  const { data, isLoading, isFetching } = useGetPurchaseBillQuery({ params });
  const purData = data?.data ? data.data : []
  const { data: partyListData } =
    useGetPartyQuery({ params });

  const filterData = () => {
    return (purData ? purData : []).filter(item => {
      return moment.utc(item?.createdAt).format("YYYY-MM-DD") >= startDate && moment.utc(item?.createdAt).format("YYYY-MM-DD") <= endDate;
    });
  };

  let totalAmount = 0;
  let filterParty = filterData()?.filter(item => partyList.find(i => parseInt(i.value) === parseInt(item.supplierId)));
  for (const obj of filterParty) {
    totalAmount += obj.netBillValue;

  }

  let exportData = filterParty.map((i, index) => ({ "S.no": index + 1, "Date": getDateFromDateTimeToDisplay(i.createdAt), "Party Name": i?.supplier?.name, "Party Dc No.": i?.supplierDcNo, "Amount": parseFloat(i?.netBillValue || 0).toFixed(2) }))

  exportData.push({ "S.no": "", "Date": "Total", "Amount": sumArray(exportData, "Amount").toFixed(2) })

  if (isLoading || isFetching) return <Loader />
  return (

    <div className='w-full  mt-1 p-2 bg-gray-300 min-h-screen'>
       <Modal onClose={() => setOpenPdfView(false)} isOpen={openPdfView} widthClass={"w-[90%] h-[90%]"}>
        <PDFViewer className='w-full h-screen'>
          <MonthlyPurchaseDocument totalAmount={totalAmount} salesList={(filterData()?.filter(item => partyList.find(i => parseInt(i.value) === parseInt(item.supplierId))))} startDate={getDateFromDateTimeToDisplay(new Date(startDate))} endDate={getDateFromDateTimeToDisplay(new Date(endDate))} />
        </PDFViewer>
      </Modal>
      <div className='flex items-center justify-between page-heading p-1 font-bold'>
        <h1 className='p-1'>Monthly Purchase Report</h1>
        <div className='flex no-print'>
          <ExcelButton onClick={() => exportFileToCsv(exportData, "Monthly Purchase Report")} width={40} />
          {/* <PrintButtonOnly onClick={() => setOpenPdfView(true)} /> */}
        </div>
      </div>

      <div className='grid  grid-cols-3  w-2/4'>
        <DateInput inputHead={"font-bold  text-sm"} name={"From :"} value={startDate} setValue={setStartDate} />
        <DateInput inputHead={"font-bold text-sm"} name={"To :"} value={endDate} setValue={setEndDate} />


        <MultiSelectDropdown name="Party :" inputClass={"w-80"} labelName={"font-bold "}
          selected={partyList}
          setSelected={setPartyList}
          options={partyListData ? multiSelectOption(partyListData.data, "name", "id") : []}

        />

      </div>
      <div className="flex w-full justify-end -mt-9">
            <PreviewButtonOnly onClick={()=>setOpenPdfView(true)} />

            </div>

      <div className='w-full h-full  p-2'>
        {filterData().length > 0 ?
          <table className="border-2 border-gray-700 table-fixed text-center w-2/4 m-auto ">
            <thead className=" bg-blue-400 border-2 border-gray-700">
              <tr className='h-2 bg-blue-400'>
                <th
                  className=" w-8 p-1 border-2 border-gray-700">
                  S. no.
                </th>
                <th
                  className="w-12 border-2 border-gray-700 "
                >
                  <label>Date</label>

                </th>


                <th className="w-44 border-2 border-gray-700">
                  <label>Party Name</label>

                </th>

                <th
                  className="w-16 border-2 border-gray-700"
                >
                  <label>Party Dc No</label>

                </th>




                <th className="w-16 border-2 border-gray-700">
                  Amount
                </th>
              </tr>
            </thead>


            <tbody className="">
              {(filterData()?.filter(item => partyList.find(i => parseInt(i.value) === parseInt(item.supplierId)))).map((dataObj, index) => (

                <tr
                  className={` table-row`}
                >
                  <td className='py-1 border border-gray-700'> {(index + 1)} </td>
                  <td className='py-1 text-left border border-gray-700 px-2'> {getDateFromDateTimeToDisplay(dataObj?.createdAt)}</td>


                  <td className='py-1 text-left border border-gray-700 px-2'>{dataObj?.supplier?.name} </td>
                  <td className='py-1 text-right border border-gray-700 px-2'>{(dataObj?.supplierDcNo
                  )}</td>


                  <td className='text-right border border-gray-700 px-2'>{parseFloat(dataObj?.netBillValue ? dataObj.netBillValue : 0).toFixed(2)}</td>

                </tr>
              ))}
              <tr className='py-2 w-full border-2 border-gray-700 bg-blue-400'>
                <td colSpan={4} className='text-center border-2 border-gray-700 font-bold text-sm bg-blue-400'>Total</td>
                <td className='text-right px-1 border-2 border-gray-700 font-bold text-sm bg-blue-400'>{parseFloat(totalAmount).toFixed(2)}</td>

              </tr>
            </tbody>

          </table>
          :
          <div className="flex justify-center items-center text-blue-900  text-3xl sm:mt-52">
            <p>{EMPTY_ICON} No Data Found...! </p>
          </div>
        }
      </div>













































      {/* {
              purchaseList.length !== 0 ?
                <table className='w-full h-full border border-gray-500 text-xs'>
                  <thead>
                    <tr className='bg-blue-400 border border-gray-500 sticky top-0 py-2'>
                      <th className='w-12'>S.No</th>
                      {Object.keys(purchaseList[0]).map((heading, i) =>
                        <th className='p-2 border border-gray-500' key={i}>
                          {heading.replace(/_+/g, ' ')}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseList.map((data, i) =>
                      <tr key={i} className='py-2 w-full table-row'>
                        <td className='text-center border border-gray-500'>{i+1}</td>
                        {Object.keys(data).map((heading, i) =>
                        <> 
                          
                          <td key={i} className={`${numericFields.includes(heading) ? "text-right" : "text-left"} p-1 px-3 border border-gray-500`}>
                            {(heading=='PurchaseDate') ? moment.utc(data[heading]).format("YYYY-MM-DD"): data[heading]}
                          
                          </td>
                          </>
                       
                        )}
                      </tr>
                    )}
                  </tbody>
                </table>
                :
                <div className="flex justify-center items-center text-blue-900  text-3xl sm:mt-52">
                  <p>{EMPTY_ICON} No Data Found...! </p>
                </div>
       

            } */}



      {/* <PDFViewer className='w-full h-screen'>
                <MonthlySalesDocument />
            </PDFViewer> */}
    </div>
  )
}

export default MonthlyPurchase
import { useState } from "react";
import { DateInput, DisabledInput } from "../../../Inputs"
import ExcelSelectionTable from "./ExcelSelectionTable"
import { getCommonParams } from "../../../Utils/helper";

const OpeningStock = () => {


  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [file, setFile] = useState(null);
  const [pres, setPres] = useState([]);
  const params = {
    branchId,
    userId,
    finYearId,
  };


  return (
    <>
      <div className='flex-1 grid gap-x-2'>
        <div className='col-span-3 grid '>
          <div className='col-span-3 grid '>
            <div className='mr-1'>
              <div className={`grid`}>
                <div className={'flex flex-col'}>
                  <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 px-3 min-h-[100px]'>
                    <legend className='sub-heading'>Order Info</legend>
                    <div className='flex flex-col justify-center items-start flex-1 w-full'>
                      <div className='grid grid-cols-5 w-full'>
                        <DisabledInput
                          name='Doc Id.'
                          required={true}
                        />
                        <DateInput
                          name='Doc Date'
                          // value={date}
                          type={'date'}
                          required={true}
                          // readOnly={readOnly}
                          disabled
                        />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-600 md:pb-5 flex flex-1'>
                    <legend className='sub-heading'>Import Details</legend>

                    <ExcelSelectionTable
                      pres={pres}
                      setPres={setPres}
                      params={params}
                      file={file}
                      setFile={setFile}
                    />

                  </fieldset>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default OpeningStock
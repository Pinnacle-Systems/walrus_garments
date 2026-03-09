import React from "react";
import { read, utils } from "xlsx";
import { convertSpaceToUnderScore } from "../../../Utils/helper";
import moment from 'moment'
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
const ExcelSelectionTable = ({ file, setFile, pres, setPres, params }) => {

  console.log(pres, "pres")

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });



  function excelDateToJSDate(serial) {

    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    let date = new Date(utc_value * 1000);

    // const excelEpoch = new Date(30, 11, 1899);
    // let date = new Date(excelEpoch.getTime() + serial * 86400000);
    date = moment(date).format("DD-MM-YYYY")
    date = date.toString()
    return date

    // return date.toISOString().split('T')[0]; 
  }

  function findFromList(name, list, property) {
    if (!list || !name) return ""
    let data = list?.find(i => (i.name).toLowerCase() === (name).toLowerCase())
    if (!data) return ""
    return data[property]
  }


  const uploadFile = () => {

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);

      const workbook = read(data, { type: "array" });
      console.log(workbook, "workbook")

      const worksheetName = workbook.SheetNames[0];
      console.log(worksheetName, "worksheetName")

      const worksheet = workbook.Sheets[worksheetName];
      console.log(worksheet, "worksheet")

      // const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      const jsonData = utils.sheet_to_json(worksheet, { header: 1, raw: false });


      const headerNames = jsonData.shift();

      console.log(jsonData, "jsonData")
      console.log(headerNames, "headerNames")

      let transformedData = jsonData
        .filter(row => row.some(cell => cell !== undefined && cell !== null && cell.toString().trim() !== ""))
        .map((row) => {
          const obj = {};
          headerNames.forEach((header, index) => {
            obj[convertSpaceToUnderScore(header)] = row[index];
            console.log(findFromList(row[index], itemList?.data, "id"), "transformedData")

            if (convertSpaceToUnderScore(header) == "item_name") {
              obj["itemId"] = findFromList(row[index], itemList?.data, "id")
            }
            if (convertSpaceToUnderScore(header) == "size") {
              obj["sizeId"] = findFromList(row[index], sizeList?.data, "id")
            }
            // if (convertSpaceToUnderScore(header) == "color") {
            //   obj["colorId"] = findFromList(row[index], colorList?.data, "id")
            // }
            console.log(convertSpaceToUnderScore(header),"convertSpaceToUnderScore(header)")
          });
          return obj;
        });

      setPres(transformedData);
    };



    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = (event.loaded / event.total) * 100;
        console.log(`Loading progress: ${percentLoaded}%`);
      }
    };



    reader.readAsArrayBuffer(file);
  };



  const header = [
    "Item Name",
    "Size",
    "Color",
    "Barcode No",
    "Qty"
  ]

  return (
    <div className="w-full">
      <div className="w-full flex flex-col gap-5">
        <div className="mt-3 flex flex-col justify-start items-start gap-10">
          <div className="flex justify-center items-center gap-5">
            <h1 className="text-sm font-bold">Upload File</h1>
            <div className='flex items-center border border-lime-500 hover:bg-lime-500 transition rounded-md h-8 px-3'>
              <input type="file" id="profileImage" className='hidden' onChange={handleFileChange} />
              <label htmlFor="profileImage" className="text-xs w-full font-bold text-center">Browse</label>
            </div>
            <button onClick={uploadFile}>Upload</button>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full table-fixed ">
              <thead className='bg-sky-200 sticky top-0'>
                <tr>
                  <th className="border border-gray-400 text-sm py-1 ">S.No</th>
                  {header.map((columnName, index) => (
                    <th className="border border-gray-400 text-sm py-1 capitalize px-2" key={index}>{convertSpaceToUnderScore(columnName)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pres?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border border-gray-400 text-sm py-1">{rowIndex + 1}</td>
                    {header.map((columnName, columnIndex) => (
                      <td className="border border-gray-400 text-xs py-1 px-1" key={columnIndex}>{row[convertSpaceToUnderScore(columnName)]}  </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExcelSelectionTable;

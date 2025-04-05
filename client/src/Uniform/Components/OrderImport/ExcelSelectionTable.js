import React from "react";
import { read, utils } from "xlsx";
import { convertSpaceToUnderScore } from "../../../Utils/helper";

const   ExcelSelectionTable = ({ file, setFile, pres, setPres }) => {

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };



  const uploadFile = () => {

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);

      const workbook = read(data, { type: "array" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];

      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      const headerNames = jsonData.shift();

      let transformedData = jsonData.map((row) => {
        const obj = {};
        headerNames.forEach((header, index) => {
          obj[convertSpaceToUnderScore(header)] = (row[index]);
        });
        return obj;
      });
      transformedData = transformedData?.map((val) => {
        return {
          ...val, bottomsize: val?.bottomsize ? val?.bottomsize : val?.size,
          bottomColor: val?.bottomColor ? val?.bottomColor : val?.color
        }
      }
      );
      // transformedData = transformedData?.map((val) => {
      //   return {
      //     ...val, bottomColor: val?.bottomColor ? val?.bottomColor : val?.color
      //   }
      // });

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
    "student name",
    "class",
    "gender",
    "color",
    "bottomcolor",
    "size",
    "bottomsize"
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
          <table className="w-full">
            <thead className='bg-sky-400'>
              <tr>
                <th className="border border-gray-400 text-sm py-1">S.No</th>
                {header.map((columnName, index) => (
                  <th className="border border-gray-400 text-sm py-1 capitalize" key={index}>{convertSpaceToUnderScore(columnName)}</th>
                ))}
              </tr>
            </thead>
            <tbody>{console.log(pres, "pressss")}
              {pres?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-gray-400 text-sm py-1">{rowIndex + 1}</td>
                  {header.map((columnName, columnIndex) => (
                    <td className="border border-gray-400 text-xs py-1" key={columnIndex}>{row[convertSpaceToUnderScore(columnName)]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExcelSelectionTable;

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { getImageUrlPath } from "../../../helper";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";

import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSocksMaterialQuery } from "../../../redux/uniformService/SocksMaterialMasterService";
import { useGetSocksTypeQuery } from "../../../redux/uniformService/SocksTypeMasterService";
import { useGetYarnNeedleMasterQuery } from "../../../redux/uniformService/YarnNeedleMasterservices";
import { useGetFiberContentMasterQuery } from "../../../redux/uniformService/FiberContentMasterServices";
import { autoFocusSelect, getCommonParams, renameFile } from '../../../Utils/helper';
import { useGetMachineQuery } from "../../../redux/services/MachineMasterService";
import { CLOSE_ICON, DELETE, VIEW } from '../../../icons';
import TableGridItems from './Yarndetails';
import Modal from "../../../UiComponents/Modal";
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetCountsMasterQuery } from '../../../redux/uniformService/CountsMasterServices';
import { useGetYarnTypeMasterQuery } from '../../../redux/uniformService/YarnTypeMasterServices';
import Swal from 'sweetalert2';
import SizeDetailsSubGrid from './SizeDetails';
import { Plus } from 'lucide-react';
import AccessoryItems from './Accessories';

const OrderItems = forwardRef(function OrderItems(

  {
    readOnly, itemHeading, setOrderDetails, orderDetails, id, setYarnItems, socksTypeData, sizeList, styleList, yarnNeedleList,
    yarnList, countsList, fiberContent, yarnTypeList, colorlist, socksMaterialData, accessoryGroupList, accessoryCategoryList, accessoryList,
    accessoryTemplate, setTemplateId, templateId, accessoryTemplateItems, setAceessoryTemplateItems, uomList, accessoryTemplateData ,
    isOpen
  },
  styleRef

) {








  const { branchId, userId, companyId, finYearId } = getCommonParams();
  const [tableDataView, setTableDataView] = useState(false)
  const [currentItem, setCurrentItem] = useState();
  const [currentIndex, setCurrentIndex] = useState("");
  const [currentAccessoryIndex, setCurrentAccessoryIndex] = useState("");

  const [gridEditableIndex, setGridEditableIndex] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [selectedAccessoryIndex, setAccessorySelectedIndex] = useState("");

  const params = {
    branchId, userId, finYearId
  };

  const [tableAccessoryView, setAccessoryDataView] = useState(false)




  let GridIndex;   //  ite used   don't remove this
  let accessoryGridIndex;



  function addNewRow() {
    if (readOnly) {

      Swal.fire({
        title: "Turn On Edit Mode",
        icon: "warning",
        draggable: true,
        timer: 1000,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      return
    }
    setOrderDetails(prev => [
      ...prev,
      {
        yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
        measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
        stripecolorId: "", design: "", noOfStripes: "0", qty: "0", socksTypeId: "",
        orderSizeDetails: [{
          qty: "", sizeMeasurement: "", sizeId: ""

        }],
        orderYarnDetails: [{ yarnId: "" }],
        orderAccessoryDetails: [{ accessoryId: "" }]

      }
    ]);
  }

  function handleInputChange(value, index, field) {
    setOrderDetails(orderDetails => {
      const newBlend = structuredClone(orderDetails);
      newBlend[index][field] = value;
      return newBlend
    }
    );
  };


  function openPreview(filePath) {
    window.open(filePath instanceof File ? URL.createObjectURL(filePath) : getImageUrlPath(filePath))
  }

  function deleteRow(index) {
    console.log(index, "index")
    if (readOnly) return toast.info("Turn on Edit Mode...!!!")
    setOrderDetails(prev => prev.filter((_, i) => i !== index))
  }

  function handleEdit(index) {
    setGridEditableIndex(index)
  }

  function handleAdd(index) {
    setOrderDetails(prev => {
      const newPrev = structuredClone(prev);


      if (!Array.isArray(newPrev[index].orderSizeDetails)) {
        newPrev[index].orderSizeDetails = [];
      }

      newPrev[index].orderSizeDetails.push({

        sizeId: "",
        sizeMesaurement: "",
        qty: 0.000,
        weight: 0.000,

      });

      return newPrev;
    });
  }

  function handleView(index) {
    setCurrentIndex(index)
    setTableDataView(true)
  }
  function handleAccessoryView(index) {
    setCurrentAccessoryIndex(index)
    setAccessoryDataView(true)
  }

  function deleteSubRow(rowIndex, subRowIndex) {
    if (readOnly) return toast.error("Turn on Edit Mode...");

    setOrderDetails(prev => {
      // const updated = [...prev];
      const updated = structuredClone(prev);
      updated[rowIndex].orderDetailsSubGrid.splice(subRowIndex, 1);


      if (updated[rowIndex].orderDetailsSubGrid.length === 0) {
        updated.splice(rowIndex, 1);
      }

      return updated;
    });
  }

  function setIndex(index) {
    console.log(index, "setInde");
    setSelectedIndex(index)
    console.log(selectedIndex, "selectedIndex")

  }
  function setAccessoryIndex(index) {
    console.log(index, "setInde");
    setAccessorySelectedIndex(index)
    console.log(selectedIndex, "selectedIndex")

  }

  // const handleKeyDown = (e, index) => {
  //   if (e.key === "Enter") {
  //     e.preventDefault();
  //     if (styleRef.current[index + 1]) {
  //       styleRef.current[index + 1].current.focus();
  //     }
  //   }
  // };

  // if (!styleRef) styleRef = { current: [] };

  // useEffect(()  => {
  //   console.log(orderDetails,"orderDetails")
  //    styleRef.current = orderDetails?.map(
  //     (_, i) => styleRef?.current[i] || React.createRef()
  //   );

  // },[orderDetails,setOrderDetails])

  const [contextMenu, setContextMenu] = useState(null);
  const [contextSubGridMenu, setContextSubGridMenu] = useState(null);


  const handleRightClick = (event, rowIndex, type) => {
    console.log(rowIndex, "rowIndexs");

    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleRightSubGridClick = (event, rowIndex, type) => {
    console.log(rowIndex, "rowIndexs");

    event.preventDefault();
    setContextSubGridMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };

  const handleCloseSubGridContextMenu = () => {
    setContextSubGridMenu(null);
  };
  const handleDeleteRow = (id) => {
    console.log(id, "idddddddddddddddd");

    setOrderDetails((prevOrderDetails) => {
      console.log(prevOrderDetails, "prevOrderDetails");
      return prevOrderDetails?.filter((_, index) => index !== id);
    });
  };




  const handleDeleteAllRows = () => {
    setOrderDetails((prevRows) => {
      if (prevRows.length <= 1) return prevRows;
      return [prevRows[0]];
    });
  };






  return (

    <>

      <Modal
        isOpen={tableDataView}
        onClose={() => setTableDataView(false)}
        widthClass="px-2 h-[70%] w-[70%]"
      >
        <TableGridItems
          item={orderDetails[selectedIndex]}
          gridIndex={selectedIndex}
          selectedIndex={selectedIndex}
          id={id}
          yarnTypeList={yarnTypeList}
          gridEditableIndex={gridEditableIndex}
          handleInputChange={handleInputChange}
          currentItem={currentItem}
          currentIndex={currentIndex}
          yarnList={yarnList}
          countsList={countsList}
          yarnNeedleList={yarnNeedleList}
          colorlist={colorlist}
          socksTypeData={socksTypeData}
          readOnly={readOnly}
          styleList={styleList?.data}
          setOrderDetails={setOrderDetails}
          orderDetails={orderDetails}
          onClose={() => setTableDataView(false)}
        />
        {/* ))} */}
      </Modal>

      <Modal
        isOpen={tableAccessoryView}
        onClose={() => setAccessoryDataView(false)}
        widthClass="px-2 h-[70%] w-[80%]"
      >
        <AccessoryItems
          item={orderDetails[selectedAccessoryIndex]}
          accessoryGridIndex={selectedAccessoryIndex}
          selectedAccessoryIndex={selectedAccessoryIndex}
          accessoryTemplateData={accessoryTemplateData}
          id={id}
          yarnTypeList={yarnTypeList}
          gridEditableIndex={gridEditableIndex}
          handleInputChange={handleInputChange}
          currentItem={currentItem}
          currentIndex={currentIndex}
          colorlist={colorlist}
          sizeList={sizeList}

          readOnly={readOnly}
          setOrderDetails={setOrderDetails}
          orderDetails={orderDetails}
          onClose={() => setAccessoryDataView(false)}
          accessoryGroupList={accessoryGroupList} accessoryCategoryList={accessoryCategoryList} accessoryList={accessoryList}
          accessoryTemplate={accessoryTemplate} templateId={templateId} setTemplateId={setTemplateId}
          accessoryTemplateItems={accessoryTemplateItems}
          setAceessoryTemplateItems={setAceessoryTemplateItems} uomList={uomList}


        />
      </Modal>

      <div className={`border border-slate-200 p-2 px-2 bg-white rounded-md shadow-sm ${isOpen ? "h-[350px]"  : "h-[540px]"}  `}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">List Of Items</h2>


        </div>

        <div className={`w-[96vw] ${isOpen ? "h-[300px]"  : "h-[500px]"} overflow-x-auto overflow-y-auto `}>

          <table className=" table-fixed w-[100vw]">
            <thead className="bg-gray-200 text-gray-800 top-0 sticky z-0">
              <tr>
                <th
                  className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  S.No
                </th>
                <th

                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style
                </th>
                <th

                  className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Image
                </th>
                <th

                  className={`w-72 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Fiber Content
                </th>
                <th

                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Socks Material
                </th>
                <th

                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Socks Type
                </th>
                <th

                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Leg Color
                </th>          <th

                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Foot Color

                </th>
                <th

                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Stripes Color
                </th>
                <th

                  className={`w-64 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Name & Logo
                </th>
                <th

                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Packing Cover
                </th>
                <th

                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Packing Type
                </th>
                <th

                  className={`w-72 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Notes
                </th>
                <th

                  className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Yarn Details
                </th>
                <th

                  className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Accessory Details
                </th>


                <th

                  className={`w-2 px-3 py-2 text-center font-medium text-[13px] `}
                >

                </th>

              </tr>
            </thead>
            <tbody className='overflow-y-auto'>
              {(orderDetails ? orderDetails : []).map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <tr className="border border-blue-gray-200"

                      onContextMenu={(e) => {
                        if (!readOnly) {
                          handleRightClick(e, index, "notes");
                        }
                      }}
                    >
                      <td className="w-12 border border-gray-300 text-[11px] text-center p-0.5">{index + 1}</td>

                      <td className=" border border-gray-300 text-[11px]">{console.log(styleRef?.current, "styleRef")}
                        <select
                          // onKeyDown={(e) => {
                          //   if (e.key === "Delete") handleInputChange("", index, "styleId");
                          // }}
                          className="text-left rounded h-full w-full py-1.5 px-2 focus:outline-none"
                          value={item?.styleId}

                          disabled={readOnly}
                          onChange={(e) => handleInputChange(e.target.value, index, "styleId")}
                          onBlur={(e) => handleInputChange(e.target.value, index, "styleId")}

                        >
                          <option value="">select</option>
                          {styleList?.data?.map((size) => (
                            <option value={size.id || ""} key={size.id}>
                              {size?.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className=" py-0.5 px-3 border border-gray-300 overflow-x-auto">
                        <div className='flex gap-2'>
                          {(!readOnly && !item.filePath) &&
                            <input
                              title=" "
                              type="file"
                              disabled={(id ? gridEditableIndex !== index : false)}
                              className='text-left w-full rounded h-full text-xs'
                              onChange={(e) =>
                                e.target.files[0] ? handleInputChange(renameFile(e.target.files[0]), index, "filePath") : () => { }
                              }
                            />

                          }
                          {item.filePath &&
                            <>
                              <span className="text-xs">{item?.filePath?.name || item?.filePath}</span>
                              <button className="text-xs" onClick={() => { openPreview(item.filePath) }}>
                                {VIEW}
                              </button>
                              {!readOnly &&
                                <button className="text-xs" onClick={() => { handleInputChange('', index, "filePath") }}>{CLOSE_ICON}</button>
                              }
                            </>
                          }
                        </div>
                      </td>

                      <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                        <select
                          disabled={readOnly}
                          onKeyDown={(e) => {
                            if (e.key === "Delete") handleInputChange("", index, "fiberContentId");
                          }}
                          className="text-left w-full  h-full py-1.5 px-2 focus:outline-none"
                          value={item?.fiberContentId}
                          onChange={(e) => handleInputChange(e.target.value, index, "fiberContentId")}
                          onBlur={(e) => handleInputChange(e.target.value, index, "fiberContentId")}

                        >
                          <option value="">select</option>
                          {fiberContent?.data?.map((size) => (
                            <option value={size.id || ""} key={size.id}>
                              {size?.fabricName}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Socks Material */}
                      <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                        <select
                          disabled={readOnly}
                          onKeyDown={(e) => {
                            if (e.key === "Delete") handleInputChange("", index, "socksMaterialId");
                          }}
                          className="text-left w-full rounded h-full py-1.5 px-2 focus:outline-none"
                          value={item?.socksMaterialId}
                          onChange={(e) => handleInputChange(e.target.value, index, "socksMaterialId")}
                          onBlur={(e) => handleInputChange(e.target.value, index, "socksMaterialId")}
                        // ref={(el) =>
                        //   autoFocusSelect(el, styleRef, !id || gridEditableIndex === index)
                        // }
                        >
                          <option value="">select</option>
                          {socksMaterialData?.data?.map((size) => (
                            <option value={size.id || ""} key={size.id}>
                              {size?.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                        <select
                          disabled={readOnly}
                          onKeyDown={(e) => {
                            if (e.key === "Delete") handleInputChange("", index, "socksTypeId");
                          }}
                          className="text-left w-full rounded h-full py-1.5 px-2 focus:outline-none"
                          value={item?.socksTypeId}
                          onChange={(e) => handleInputChange(e.target.value, index, "socksTypeId")}
                          onBlur={(e) => handleInputChange(e.target.value, index, "socksTypeId")}
                        >
                          <option value="">select</option>
                          {socksTypeData?.data?.map((size) => (
                            <option value={size.id || ""} key={size.id}>
                              {size?.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <select
                          onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "legColorId") } }}
                          tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 focus:outline-none'
                          value={item.legColorId}
                          onChange={(e) => handleInputChange(e.target.value, index, "legColorId")}
                          onBlur={(e) => {
                            handleInputChange((e.target.value), index, "legColorId")
                          }
                          }
                        >
                          <option >
                          </option>
                          {(id ? colorlist?.data : colorlist?.data?.filter(item => item.active))?.map((blend) =>
                            <option value={blend.id} key={blend.id}>
                              {blend?.name}
                            </option>)}
                        </select>
                      </td>
                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <select
                          onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "footColorId") } }}
                          tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 focus:outline-none'
                          value={item.footColorId}
                          onChange={(e) => handleInputChange(e.target.value, index, "footColorId")}
                          onBlur={(e) => {
                            handleInputChange((e.target.value), index, "footColorId")
                          }
                          }
                        >
                          <option >
                          </option>
                          {(id ? colorlist?.data : colorlist?.data?.filter(item => item.active))?.map((blend) =>
                            <option value={blend.id} key={blend.id}>
                              {blend?.name}
                            </option>)}
                        </select>
                      </td>

                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <select
                          onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "stripesColorId") } }}
                          tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 focus:outline-none'
                          value={item.stripesColorId}
                          onChange={(e) => handleInputChange(e.target.value, index, "stripesColorId")}
                          onBlur={(e) => {
                            handleInputChange((e.target.value), index, "stripesColorId")
                          }
                          }
                        >
                          <option >
                          </option>
                          {(id ? colorlist?.data : colorlist?.data?.filter(item => item.active))?.map((blend) =>
                            <option value={blend.id} key={blend.id}>
                              {blend?.name}
                            </option>)}
                        </select>
                      </td>
                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <textarea
                          type="text"

                          min="0"
                          rows={1}
                          onFocus={e => e.target.select()}
                          className="text-left rounded w-full py-1 text-xs "
                          value={item.nameAndLogo}
                          disabled={readOnly}
                          onChange={e => handleInputChange(e.target.value, index, "nameAndLogo")}
                          onBlur={e => handleInputChange(e.target.value, index, "nameAndLogo")}
                        />
                      </td>
                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <select
                          className="text-left rounded w-full py-1 text-xs "

                          value={item.packingCover}
                          disabled={readOnly}
                          onChange={e => handleInputChange(e.target.value, index, "packingCover")}
                          onBlur={e => handleInputChange(e.target.value, index, "packingCover")}
                        >
                          <option value=''>Select Status</option>
                          <option value='printed'>PRINTED</option>
                          <option value='plain'>PLAIN</option>
                        </select>
                      </td>
                      <td className="py-0.5 border border-gray-300 text-[11px]">
                        <input
                          type="text"

                          min="0"
                          rows={1}
                          onFocus={e => e.target.select()}
                          className="text-left rounded w-full py-1 text-xs "
                          value={item.packingType}
                          disabled={readOnly}
                          onChange={e => handleInputChange(e.target.value, index, "packingType")}
                          onBlur={e => handleInputChange(e.target.value, index, "packingType")}
                        />
                      </td>
                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <textarea
                          type="text"

                          min="0"
                          rows={1}
                          onFocus={e => e.target.select()}
                          className="text-left rounded w-full py-1 text-xs "
                          value={item.notes}
                          disabled={readOnly}
                          onChange={e => handleInputChange(e.target.value, index, "notes")}
                          onBlur={e => handleInputChange(e.target.value, index, "notes")}
                        />
                      </td>
                      <td className='w-40 py-0.5 border border-gray-300 text-[11px] text-center'>
                        <button
                          readOnly={readOnly}
                          className="text-center rounded py-1 "

                          onClick={() => {
                            handleView(index)
                            setIndex(index)
                            GridIndex = index
                          }}
                        >
                          {VIEW}
                        </button>
                      </td>

                      <td className='w-40 py-0.5 border border-gray-300 text-[11px] text-center'>
                        <button
                          readOnly={readOnly}
                          className="text-center rounded py-1 "

                          onClick={() => {
                            handleAccessoryView(index)
                            setAccessoryIndex(index)
                            accessoryGridIndex = index
                          }}
                        >
                          {VIEW}
                        </button>
                      </td>
                      <td className="border border-gray-300 text-center">
                        <button
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addNewRow();
                            }
                          }}
                          className="flex items-center justify-center w-full py-1"
                        >
                          <Plus size={18} className="text-red-800" />
                        </button>
                      </td>

                    </tr>


                    <SizeDetailsSubGrid
                      gridIndex={index}
                      id={id}
                      item={item}
                      orderDetails={orderDetails}
                      setOrderDetails={setOrderDetails}
                      readOnly={readOnly}
                      sizeList={sizeList}
                      handleAdd={handleAdd}
                      handleInputChange={handleInputChange}
                      index={index}
                      deleteSubRow={deleteSubRow}
                      handleCloseSubGridContextMenu={handleCloseSubGridContextMenu}

                      contextSubGridMenu={contextSubGridMenu}
                      setContextSubGridMenu={setContextSubGridMenu}
                      handleRightSubGridClick={handleRightSubGridClick}
                      yarnNeedleList={yarnNeedleList}
                    />

                  </React.Fragment>
                );


              })}

            </tbody>
          </table>
        </div>
      </div>
      {contextMenu && (
        <div
          style={{
            position: "absolute",
            top: `${contextMenu.mouseY - 300}px`,
            left: `${contextMenu.mouseX - 30}px`,

            // background: "gray",
            boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
            padding: "8px",
            borderRadius: "4px",
            zIndex: 1000,
          }}
          className="bg-gray-100"
          onMouseLeave={handleCloseContextMenu} // Close when the mouse leaves
        >
          <div className="flex flex-col gap-1">
            <button
              className=" text-black text-[12px] text-left rounded px-1"
              onClick={() => {
                handleDeleteRow(contextMenu.rowId);
                handleCloseContextMenu();
              }}
            >
              Delete{" "}
            </button>
            <button
              className=" text-black text-[12px] text-left rounded px-1"
              onClick={() => {
                handleDeleteAllRows();
                handleCloseContextMenu();
              }}
            >
              Delete All
            </button>
          </div>
        </div>
      )}

    </>


  );
})



export default OrderItems;
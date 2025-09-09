import React, { forwardRef, useEffect, useState } from 'react';
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
import SizeDetailsSubGrid from './SizeDetailsSubGrid';

const OrderItems = forwardRef(function OrderItems(
  { readOnly, itemHeading, setOrderDetails, orderDetails, id, setYarnItems },
  styleRef
) {






  // useEffect(() => {
  //   const focusRowIndex = 0; // first row
  //   if (styleRef.current[focusRowIndex]?.current) {
  //     styleRef.current[focusRowIndex].current.focus();
  //   }
  // }, [orderDetails, setOrderDetails]);

  const { branchId, userId, companyId, finYearId } = getCommonParams();
  const [tableDataView, setTableDataView] = useState(false)
  const [currentItem, setCurrentItem] = useState();
  const [currentIndex, setCurrentIndex] = useState("");
  const [gridEditableIndex, setGridEditableIndex] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState("");
  const params = {
    branchId, userId, finYearId
  };
  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });

  const { data: socksMaterialData } =
    useGetSocksMaterialQuery({ params: { ...params } });


  let GridIndex;


  const { data: socksTypeData } =
    useGetSocksTypeQuery({ params: { ...params } });
  const { data: sizeList, isLoading: isSizeListLoading } = useGetSizeMasterQuery({ params: { ...params } });
  const { data: styleList, isLoading: isStyleListLoading } = useGetStyleMasterQuery({ params: { ...params } });
  const { data: yarnNeedleList } = useGetYarnNeedleMasterQuery({ params: { ...params } });
  const { data: yarnList } = useGetYarnMasterQuery({ params: { ...params } });
  const { data: countsList } = useGetCountsMasterQuery({ params: { ...params } });



  const { data: fiberContent } = useGetFiberContentMasterQuery({ params: { ...params } });
  const { data: yarnTypeList } = useGetYarnTypeMasterQuery({ params: { ...params } });

  const {
    data: colorlist,
    isLoading: isColorListLoading,
    isFetching: isColorListFetching,
  } = useGetColorMasterQuery({ params });

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
        orderYarnDetails: [{ yarnId: "" }]

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
        qty: 0,

      });

      return newPrev;
    });
  }

  function handleView(index) {
    setCurrentIndex(index)
    setTableDataView(true)
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


  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (styleRef.current[index + 1]) {
        styleRef.current[index + 1].current.focus();
      }
    }
  };

  // if (!styleRef) styleRef = { current: [] };

  // useEffect(()  => {
  //   console.log(orderDetails,"orderDetails")
  //    styleRef.current = orderDetails?.map(
  //     (_, i) => styleRef?.current[i] || React.createRef()
  //   );

  // },[orderDetails,setOrderDetails])

  const [contextMenu, setContextMenu] = useState(null);

  const handleRightClick = (event, rowIndex, type) => {
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

  const handleDeleteRow = (id) => {
    console.log(id, "rowId");

    // setOrderDetails((yarnBlend) => {
    //   // if (yarnBlend.length <= 1) {
    //   //   return yarnBlend;
    //   // }
    //   return yarnBlend.filter((_, index) => index !== parseInt(id));
    // });

    setOrderDetails((prevOrderDetails) =>
      prevOrderDetails.filter((_, index) => index !== Number(id))
    );


  };



  const handleDeleteAllRows = () => {
    setOrderDetails((prevRows) => {
      if (prevRows.length <= 1) return prevRows;
      return [prevRows[0]];
    });
  };
  function autoFocusAndOpenSelect(el, condition = true, refObj = null) {
    if (el && condition) {
      // Auto focus
      el.focus();

      // Try to open dropdown (works in Chrome/Edge/Firefox)
      const keyboardEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "ArrowDown",
        code: "ArrowDown",
      });
      el.dispatchEvent(keyboardEvent);
    }

    // keep ref if passed
    if (refObj) {
      refObj.current = el;
    }
  }

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

      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm h-[350px] overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
          {/* <div className="flex gap-2 items-center">

            <button
              onClick={() => {
                addNewRow()
              }}
              className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
            >
              <HiPlus className="w-3 h-3 mr-1" />
              Add Item
            </button>
          </div> */}

        </div>

        <div className="overflow-x-auto">

          <table className="w-full  table-fixed">
            <thead className="bg-gray-200 text-gray-800">
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

                  className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
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
                  Base Color
                </th>
                <th

                  className={`w-5 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Yarn Details
                </th>

                <th

                  className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                >
                  Actions
                </th>

              </tr>
            </thead>
            <tbody>
              {(orderDetails ? orderDetails : []).map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <tr className="border border-blue-gray-200">
                      <td className="w-12 border border-gray-300 text-[11px] text-center p-0.5">{index + 1}</td>

                      <td className=" border border-gray-300 text-[11px]">{console.log(styleRef?.current, "styleRef")}
                        <select
                          // onKeyDown={(e) => {
                          //   if (e.key === "Delete") handleInputChange("", index, "styleId");
                          // }}
                          className="text-left rounded h-full w-full py-1.5 px-2 focus:outline-none"
                          value={item?.styleId}

                          disabled={id ? gridEditableIndex !== index : false}
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

                      <td className="py-0.5 px-3 border border-gray-300 overflow-x-auto">
                        <div className="flex gap-2">
                          {!readOnly && !item.filePath && (
                            <input
                              type="file"
                              disabled={id ? gridEditableIndex !== index : false}
                              className="text-left w-full rounded h-full text-xs focus:outline-none"
                              onFocus={(e) => {
                                e.target.click();
                              }}
                              onChange={(e) =>
                                e.target.files[0]
                                  ? handleInputChange(renameFile(e.target.files[0]), index, "filePath")
                                  : () => { }
                              }
                            />
                          )}

                          {item.filePath && (
                            <>
                              <span className="text-xs">{item?.filePath?.name || item?.filePath}</span>
                              <button className="text-xs" onClick={() => openPreview(item.filePath)}>
                                {VIEW}
                              </button>
                              {!readOnly && (
                                <button
                                  className="text-xs"
                                  onClick={() => handleInputChange("", index, "filePath")}
                                >
                                  {CLOSE_ICON}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>


                      {/* Fiber Content */}
                      <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                        <select
                          disabled={id ? gridEditableIndex !== index : false}
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

                      {/* Socks Type */}
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
                          onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "baseColorId") } }}
                          tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 focus:outline-none'
                          value={item.baseColorId}
                          onChange={(e) => handleInputChange(e.target.value, index, "baseColorId")}
                          onBlur={(e) => {
                            handleInputChange((e.target.value), index, "baseColorId")
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
                      <td className='flex items-center justify-center border border-gray-300 text-[11px] '>
                        <button
                          onClick={() => {
                            handleView(index)
                            setIndex(index)
                            GridIndex = index
                          }

                          }
                          // onMouseEnter={() => setTooltipVisible(true)}
                          // onMouseLeave={() => setTooltipVisible(false)}
                          className="text-blue-800 rounded h-full  text-lg focus:outline-none"
                        >
                          <span className=''>👁</span>
                        </button>
                      </td>

                      <td
                        className=""

                      >
                        <input

                          onContextMenu={(e) => {
                            if (!readOnly) {
                              handleRightClick(e, index, "notes");
                            }
                          }}
                          className='focus:outline-none '
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addNewRow();
                            }
                          }}

                        />
                      </td>
                    </tr>
                    {contextMenu && (
                      <div
                        style={{
                          position: "absolute",
                          top: `${contextMenu.mouseY - 50}px`,
                          left: `${contextMenu.mouseX + 20}px`,

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
                            Delete
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

                    />

                  </React.Fragment>
                );


              })}

            </tbody>
          </table>


        </div>
      </div>
    </>



  );
})



export default OrderItems;
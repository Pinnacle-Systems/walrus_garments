import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import {
  useGetFinYearQuery,
  useGetFinYearByIdQuery,
  useAddFinYearMutation,
  useUpdateFinYearMutation,
  useDeleteFinYearMutation
} from '../../../redux/services/FinYearMasterService';
import FormHeader from '../FormHeader';
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify"
import { DateInput, CheckBox, DisabledInput, ToggleButton, ReusableTable, TextInput, DateInputNew } from "../../../Inputs"
import ReportTemplate from '../ReportTemplate';
import { getDateFromDateTimeToDisplay, getYearShortCode } from '../../../Utils/helper';

import Mastertable from '../MasterTable/Mastertable';
import MastersForm from '../MastersForm/MastersForm';
import { statusDropdown } from '../../../Utils/DropdownData';
import moment from 'moment';
import Modal from '../../../UiComponents/Modal';
import { Check, Plus, Power } from 'lucide-react';
import Swal from 'sweetalert2';




export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("")
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [active, setActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [code, setCode] = useState();
  const childRecord = useRef(0);
  const [errors, setErrors] = useState({});

  console.log(from)

  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
  const { data: allData } = useGetFinYearQuery({ params, searchParams: searchValue });
  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetFinYearByIdQuery(id, { skip: !id });

  const [addData] = useAddFinYearMutation();
  const [updateData] = useUpdateFinYearMutation();
  const [removeData] = useDeleteFinYearMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setReadOnly(false);
        setTo(data?.to || "");
        setFrom(data?.from || "");
        setActive(id ? (data?.active) : true);

        setCode("")
      } else {
        // setReadOnly(true);
        setTo(data?.to ? moment?.utc(data.to).format('YYYY-MM-DD') : "");
        setFrom(data?.from ? moment?.utc(data.from).format('YYYY-MM-DD') : "");
        setActive(id ? (data?.active ?? false) : true);
        setCode((data?.from) && (data?.to) ? getYearShortCode(data?.from, data?.to) : "")
      }
    }, [id])


  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


  const data = {
    from, to, active,
    companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), id
  }

  const validateData = (data) => {
    if (data.from && data.to) {
      return true;
    }
    return false;
  }

  const validateOneActiveFinYear = (active) => {
    if (Boolean(active)) {
      return !allData.data.some((finYear) => id === finYear.id ? false : Boolean(finYear.active))
    }
    return true
  }

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id)
      syncFormWithDb(undefined)
      // toast.success(text + "Successfully");
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",

      });
      if (nextProcess == "new") {
        syncFormWithDb(undefined)
        onNew()
      } else {
        setForm(false)
      }
    } catch (error) {
      console.log("handle")
      setForm(false);
    }
  }

  const saveData = (nextProcess) => {
    if (!validateOneActiveFinYear(data.active)) {
      Swal.fire({
        title: "Only one Fin year can be active...!",
        icon: "success",

      });
      return
    }
    if (!validateData(data)) {
      // toast.error("Please fill all required fields...!", { position: "top-center" })
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "success",

      });
      return
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess)
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess)
    }
  }

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          toast.error(deldata?.message)
          return
        }
        setId("");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",

        }); setForm(false)
      } catch (error) {
        toast.error("something went wrong")
      }
      ;
    }
  }

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === 's') {
      event.preventDefault();
      saveData();
    }
  }

  const onNew = () => { setId(""); setReadOnly(false); setForm(true); setSearchValue("") }

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
    console.log("view");
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
    console.log("Edit");
  };

  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },

    {
      header: "From",
      accessor: (item) => getDateFromDateTimeToDisplay(item?.from),
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-32",
    },
    {
      header: "To",
      accessor: (item) => getDateFromDateTimeToDisplay(item?.to),
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-32",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },

  ];


  return (
    




    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-2xl font-bold text-gray-800">Fin Year</h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Fin Year
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>

      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[40%] h-[40%]"}
            onClose={() => {
              setForm(false);
              setErrors({});
            }}
          >
            <div className="h-full flex flex-col bg-gray-200 ">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Fin Year  Master"
                        : "Fin Year"
                      : "Add New Fin Year"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <div>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(false);
                          setSearchValue("");
                          setId(false);
                        }}
                        className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("close")
                        }}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {id ? "Update" : "Save & close"}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(!readOnly && !id) && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("new")
                        }}

                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {"Save & New"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-3 ">
                <div className="lg:col-span-2 h-full">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                    <div className="grid grid-cols-2 gap-3">


                      <DateInputNew type={"date"} name="From" value={from} setValue={setFrom} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />


                      {errors.name && <span className="text-red-500 text-xs ml-1">{errors.name}</span>}

                      <DateInputNew name="To" type={"date"} value={to} setValue={setTo} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                      <div className=''>

                        <TextInput name="Short Code" value={code} disabled={true} />
                      </div>
                      <div className='mt-2'>

                        <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} disabled={childRecord.current > 0} />
                      </div>


                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div >
    </div >
  )
}

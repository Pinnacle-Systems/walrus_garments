import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetStateQuery,
  useGetStateByIdQuery,
  useAddStateMutation,
  useUpdateStateMutation,
  useDeleteStateMutation,
} from "../../../redux/services/StateMasterService";
import { useGetCountriesQuery } from "../../../redux/services/CountryMasterService";

import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, DropdownInput, ToggleButton, Modal } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import { dropDownListObject } from '../../../Utils/contructObject';
import { useDispatch } from "react-redux";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from '../MastersForm/MastersForm';


const MODEL = "State Master";

export default function Form() {
  const [form, setForm] = useState(false);
  const [errors, setErrors] = useState({});

  const [openTable, setOpenTable] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [country, setCountry] = useState("");
  const [gstNo, setGstNo] = useState("");

  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);
  const dispatch = useDispatch();

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const { data: countriesList, isLoading: isCountryLoading, isFetching: isCountryFetching } =
    useGetCountriesQuery({ params });

  const { data: allData, isLoading, isFetching } = useGetStateQuery({ params, searchParams: searchValue });



  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetStateByIdQuery(id, { skip: !id });

  const [addData] = useAddStateMutation();
  const [updateData] = useUpdateStateMutation();
  const [removeData] = useDeleteStateMutation();

  const syncFormWithDb = useCallback((data) => {
    if (!id) {
      setReadOnly(false);
      setActive(false)
      setName("");
      setCode("");
      setActive(id ? (data?.active ?? true) : false);
      setCountry("");
      setGstNo("");

      return
    }
    setReadOnly(true);
    setActive(true)
    setName(data?.name || "");
    setCode(data?.code || "");
    setActive(id ? (data?.active ?? false) : true);
    setCountry(data?.countryId || "");
    setGstNo(data?.gstNo || "");
    childRecord.current = data?.childRecord ? data?.childRecord : 0;
  }, [id]);

  console.log(childRecord.current)

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name, code, active, country, gstNo, id
  };

  const validateData = (data) => {
    if (data.name && data.code) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id)
      toast.success(text + "Successfully");
      dispatch({
        type: `countryMaster/invalidateTags`,
        payload: ['Countries'],
      });

    } catch (error) {
      console.log(error)
      console.log("handle");
    }
  };

  const saveData = () => {
    if (!validateData(data)) {
      toast.error("Please fill all required fields...!", {
        position: "top-center",
      });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id)
        setId("");
        dispatch({
          type: `countryMaster/invalidateTags`,
          payload: ['Countries'],
        });
        toast.success("Deleted Successfully");
        setForm(false)
      } catch (error) {
        toast.error("something went wrong");
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
  };
  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = [
    "S.NO", "Code", "Name", "Country", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " "
  ]
  const tableDataNames = [
    "index+1", "dataObj.code", "dataObj.name", "dataObj.country.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " "]


  return (
    <div onKeyDown={handleKeyDown}>
      <div className='w-full flex justify-between mb-2 items-center px-0.5'>
        <h5 className='my-1'>State Master</h5>
        <div className='flex items-center'>
          <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
        </div>
      </div>



      <div className='w-full flex items-start'>

        <Mastertable
          header={'State list'}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onDataClick={onDataClick}
          // setOpenTable={setOpenTable}
          tableHeaders={tableHeaders}
          tableDataNames={tableDataNames}
          data={allData?.data}
          loading={
            isLoading || isFetching
          }
        />

        <div>
          {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[40%]"} onClose={() => { setForm(false); setErrors({}); }}>
            <MastersForm
              onNew={onNew}
              onClose={() => {
                setForm(false);
                setSearchValue("");
                setId(false);
              }}
              model={MODEL}
              childRecord={childRecord.current}
              saveData={saveData}
              setReadOnly={setReadOnly}
              deleteData={deleteData}
              readOnly={readOnly}
              emptyErrors={() => setErrors({})}
            >

              <fieldset className=' rounded mt-2'>


                <div className="flex">
                  <div className="mb-3 w-[200px]">
                    <TextInput
                      name="State Name"
                      type="text"
                      value={name}
                      setValue={setName}
                      required={true}
                      readOnly={readOnly}

                      disabled={(childRecord.current > 0)}
                    />
                  </div>
                  <div className="mb-3 ms-3">
                    <TextInput
                      name="Code"
                      type="text"
                      value={code}
                      setValue={setCode}
                      required={true}
                      readOnly={readOnly}
                      disabled={(childRecord.current > 0)}

                    />
                  </div>
                </div>

                <div className='flex'>
                  <div className="mb-3 w-[200px]">

                    <TextInput
                      name="GST No"
                      type="text"
                      value={gstNo}
                      setValue={setGstNo}
                      readOnly={readOnly}
                      disabled={(childRecord.current > 0)}
                      width={'w-[200px]'}

                    />
                  </div>
                  <div className='w-[200px] mb-3 ms-3'>
                    <DropdownInput
                      name="Country"
                      options={dropDownListObject(id ? countriesList.data : countriesList.data.filter(item => item.active), "name", "id")}
                      value={country}
                      setValue={setCountry}
                      required={true}
                      readOnly={readOnly}
                      className={`w-[150px]`}
                    />
                  </div>
                </div>



                <div>
                  <ToggleButton name="Status" value={active} setActive={setActive} required={true} readOnly={readOnly} />
                </div>

              </fieldset>
            </MastersForm>
          </Modal>}
        </div>
      </div>




    </div>
  )
}
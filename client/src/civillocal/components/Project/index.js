import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import Modal from "../../../UiComponents/Modal";

import FormHeader from '../../../Basic/components/FormHeader';
import { toast } from "react-toastify"
import { DropdownInput, TextArea, DisabledInput, TextInput } from "../../../Inputs"

import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { dropDownListObject } from '../../../Utils/contructObject';
import { getDateFromDateTime } from '../../../Utils/helper';
import { useGetPartyByIdQuery, useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { Loader } from '../../../Basic/components';
import { useGetStateQuery } from '../../../redux/services/StateMasterService';
import {
  useGetProjectQuery,
  useGetProjectByIdQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '../../../redux/services/ProjectService';
import Report from './Report';
import LineItems from './LineItems';
import { useGetQuotesQuery, useUpdateQuotesMutation } from '../../../redux/services/QuotesService';
import PartySearchOnly from './PartySearchOnly';
import { forEach } from 'lodash';
import moment from 'moment';
import ProjectPayments from './ProjectPayments';
import ProjectExpenses from './ProjectExpenses';
import { useSelector } from 'react-redux';

const MODEL = "Project";

export default function Form({ navigateProjectId }) {

  const openTabs = useSelector((state) => state.openTabs);


  let projectUpdate = openTabs?.tabs?.find(val => parseInt(val.id) === parseInt(65))?.projectId

  useEffect(() => {
    if (!projectUpdate) return

    setId(projectUpdate || "")
  }, [projectUpdate])

  const today = new Date()
  const [form, setForm] = useState(openTabs?.tabs?.find(val => parseInt(val.id) === parseInt(65))?.projectForm || false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState()

  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("");
  const [quotesItems, setQuotesItems] = useState([])
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [docId, setDocId] = useState("");
  const [formReport, setFormReport] = useState(false)
  const [lineItems, setLineItems] = useState([]);
  const [projectArray, setProjectArray] = useState([]);
  const [projectAddress, setProjectAddress] = useState([]);
  const [quoteId, setQuoteId] = useState("")
  const [clientId, setClientId] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [quotesUpdate, setQuotesUpdate] = useState(false)
  const [shippingAddressId, setShippingAddressId] = useState("")
  const [addressData, setAddressData] = useState([]);
  const [isOpenExpenses, setIsOpenExpenses] = useState(false);
  const [isOpenPayments, setIsOpenPayments] = useState(false)
  const childRecord = useRef(0);
  const [searchValue, setSearchValue] = useState("");
  const [lineEditableIndex, setLineEditableIndex] = useState(null);
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )

  const params = {
    branchId, companyId
  };
  const { data: allData, isLoading, isFetching } = useGetProjectQuery({ params: { branchId } });


  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetProjectByIdQuery(id, { skip: !id });

  const [addData] = useAddProjectMutation();
  const [updateData] = useUpdateProjectMutation();
  const [removeData] = useDeleteProjectMutation();


  const { data: partyList } = useGetPartyQuery({ params })
  const { data: quoteList } = useGetQuotesQuery({ params })
  const { data: stateList } = useGetStateQuery({ params })

  const { data: uomList } = useGetUomQuery({ params })


  function getNextDocId() {
    if (id || isLoading || isFetching) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }



  // const getNextDocId = useCallback(() => {
  //   if (id || isLoading || isFetching) return
  //   if (allData?.nextDocId) {
  //     setDocId(allData.nextDocId)
  //   }
  // }, [allData, isLoading, isFetching, id])

  // useEffect(getNextDocId, [getNextDocId])

  const syncFormWithDb = useCallback(
    (data) => {

      if (id) setReadOnly(true);
      if (data?.docId) {
        setDocId(data?.docId)
      }
      // setName(data?.name ? data.name : "");
      setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
      setProjectName(data?.projectName ? data?.projectName : "")
      setDescription(data?.description ? data?.description : "");
      setClientId(data?.clientId ? data?.clientId : "");
      // setShippingAddressId(data?.shippingAddressId ? data?.shippingAddressId : "");
      setAddress(data?.address || "");
      setLocation(data?.location || "");
      setLineItems(data?.LineItems ? data?.LineItems : [])
      setLineEditableIndex(null)
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }, [id])



  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


  const { data: clientData } = useGetPartyByIdQuery(clientId, { skip: !clientId })

  useEffect(() => {
    if (id || !clientData) return
    let address = clientData?.data?.address || "";
    setAddress(address)
  }, [clientData, id])

  const data = {
    id,
    projectName: projectName.toString(),
    branchId, clientId,
    location,
    address,
    description,

    lineItems
  }


  const validateData = (data) => {
    if (!data.clientId || !data.projectName) return false;
    if (data?.lineItems?.length === 0) return false
    return true;
  }



  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      if (returnData.statusCode === 0) {
        setId(returnData?.data?.id)
        // syncFormWithDb(returnData?.data)
        toast.success(text + "Successfully");
        // setQuoteId("");
        // setLineItems([])
      } else {
        toast.error(returnData?.message)
      }
    } catch (error) {
      console.log("handle")
    }
  }


  const handleQuotesUpdate = async (callback, lineItemsData, text) => {
    try {
      await callback(lineItemsData).unwrap();
      toast.success(text + "Successfully");

    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", { position: "top-center" })
      return
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return
    }

    if (id) {
      handleSubmitCustom(updateData, data, "Updated")

    } else {
      handleSubmitCustom(addData, data, "Added")

    }
  }

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return
      }
      try {
        let returnData = await removeData(id).unwrap();
        if (returnData.statusCode === 0) {
          setId("")
          syncFormWithDb(undefined)
          toast.success("Deleted Successfully");
        } else {
          toast.error(returnData?.message)
        }
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

  const onNew = () => {
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
    setId("");
    setForm(true);
    setReadOnly(false);
    setSearchValue("");
    setLineItems([]);
    setClientId("");
    syncFormWithDb(undefined)

    setAddress("")
  }

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  useEffect(() => {
    let Data = partyList?.data?.find(val => parseInt(val.id) === parseInt(clientId))?.ShippingAddress
    setAddressData(Data)

  }, [clientId, partyList, id])



  useEffect(() => {
    if (!clientId) return


    setProjectArray([])
    let projectList = quoteList?.data?.filter(val => parseInt(val?.clientId) === parseInt(clientId))
    if (projectList?.length > 0) {
      const uniqueArray = projectList.filter((item, index) => {
        return projectList.findIndex(i => i.projectName === item.projectName) === index;
      });
      setProjectArray(uniqueArray)
    }
    else {
      return setProjectName(singleData?.data?.projectName ? singleData?.data?.projectName : "")
    }




  }, [clientId, setProjectArray, quoteList])





  if (!form)
    return (

      <Report setQuotesUpdate={setQuotesUpdate}

        onClick={onDataClick}
        onNew={onNew}
        onNewButton={true}
      />
    );
  if (!partyList || !uomList || !stateList) return <Loader />
  return (
    <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>

      <Modal

        isOpen={formReport}
        onClose={() => setFormReport(false)}
        widthClass={"px-2 h-[90%] w-[90%]"}

      >
        <Report setQuotesUpdate={setQuotesUpdate} onClick={(id) => { setId(id); setFormReport(false); setQuotesUpdate(true) }} onNewButton={false} />
      </Modal>


      <Modal

        isOpen={isOpenPayments}
        onClose={() => setIsOpenPayments(false)}
        widthClass={"px-2 h-[90%] w-[90%]"}

      >
        <ProjectPayments partyId={clientId} projectId={id} address={address} onClick={() => { setIsOpenPayments(false); }} setIsOpenPayments={setIsOpenPayments} />
      </Modal>


      <Modal

        isOpen={isOpenExpenses}
        onClose={() => setIsOpenExpenses(false)}
        widthClass={"px-2 h-[90%] w-[90%]"}

      >
        <ProjectExpenses partyId={clientId} projectId={id} address={address} onClick={() => { setIsOpenExpenses(false); }} setIsOpenExpenses={setIsOpenExpenses} />
      </Modal>
      <div className='flex flex-col frame w-full h-full'>
        <FormHeader
          onNew={onNew}
          onClose={() => {
            setForm(false);
            setSearchValue("");


          }}
          model={MODEL}
          openReport={() => setFormReport(true)}
          saveData={saveData} setReadOnly={setReadOnly}
          deleteData={deleteData}
        />
        <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
          <div className='col-span-4 grid md:grid-cols-1 border overflow-auto'>
            <div className='mr-1 md:ml-2'>
              <fieldset className='frame my-1'>
                <legend className='sub-heading'>Project Info</legend>



                <div className='grid grid-cols-4 w-[100%]'>
                  <div className=''>
                    <div className={`flex gap-x-3 items-center md:my-0.5 md:px-1 data `}>
                      <label className={`md:text-start flex  `}>Doc Id.</label>
                      <input className={` w-32 p-1 focus:outline-none md:col-span-2 border border-gray-500 rounded`} value={docId} disabled />
                    </div>


                  </div>
                  <div className=''>
                    <div className={`flex gap-x-3 items-center md:my-0.5 md:px-1 data `}>
                      <label className={`md:text-start flex  `}>Doc.Date</label>
                      <input type={Date} className={` w-32 p-1 focus:outline-none md:col-span-2 border border-gray-500 rounded`} value={date} disabled />
                    </div>

                  </div>
                  <div className=''>
                    <PartySearchOnly setPartyId={setClientId} partyId={clientId} name={"Client Name"} id={id} />

                  </div>
                  <div className='ml-20'>

                    <div className={`flex gap-x-3 items-center md:my-0.5 md:px-1 data `}>
                      <label className={`md:text-start flex `}>Location</label>
                      <input type={"text"} className={`${"input-field focus:outline-none md:col-span-2 border-gray-500 border rounded"}`} value={location} onChange={(e) => { setLocation(e.target.value) }} readOnly={readOnly} />
                    </div>

                  </div>

                </div>



                <div className='flex gap-x-10 mt-3 w-full'>


                  <div className='w-[30%]'>
                    <div className='flex gap-x-5 text-xs items-center'>
                      <label className={``}>Project Name </label>
                      <select
                        disabled={id ? true : false}

                        className='text-left w-[70%] rounded py-1 tx-table-input border border-gray-400'
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      >
                        <option className='text-gray-600'>
                          select
                        </option>
                        {projectArray?.map((data) =>
                          <option value={data.projectName} key={data.projectName}>
                            {data.projectName}
                          </option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className='w-[30%]'>
                    <div className='flex gap-x-9 text-xs items-center'>
                      <label className='md:text-start flex'>Address</label>
                      <textarea className='focus:outline-none md:col-span-2 border border-gray-500 rounded w-[70%]' value={address} onChange={(e) => { setAddress(e.target.value); }} readOnly={readOnly}></textarea>
                    </div>


                  </div>

                  <div className='w-[40%]'>
                    <div className='flex gap-x-9 text-xs items-center'>
                      <label className='md:text-start flex'>Description</label>
                      <textarea className='focus:outline-none md:col-span-2 border border-gray-500 rounded w-[70%]' value={description} onChange={(e) => setDescription(e.target.value)} readOnly={readOnly}></textarea>
                    </div>


                  </div>




                </div>



                <div className="ml-5 mt-3">
                  <button
                    type='button' className={`text-white bg-green-600 rounded-md p-1 w-24 mr-5 mb-5`}
                    onClick={() => {
                      setIsOpenPayments(true)

                    }}

                  > Payments
                  </button>

                  <button className={`text-white bg-orange-600 rounded-md p-1 w-24 mr-5 mb-5`}
                    onClick={() => {
                      setIsOpenExpenses(true)
                    }}
                  >Expenses</button>
                </div>
              </fieldset>
              <LineItems lineEditableIndex={lineEditableIndex} setLineEditableIndex={setLineEditableIndex} readOnly={readOnly} lineItems={lineItems} setLineItems={setLineItems} quoteId={quoteId} id={id} projectName={projectName} clientId={clientId} saveData={saveData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

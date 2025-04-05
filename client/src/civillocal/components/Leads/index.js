import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import Modal from "../../../UiComponents/Modal";

import FormHeader from '../../../Basic/components/FormHeader';
import { toast } from "react-toastify"

import {
  useGetProductQuery,

} from '../../../redux/services/ProductMasterService'

import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { getDateFromDateTime } from '../../../Utils/helper';
import { useGetUserByIdQuery } from '../../../redux/services/UsersMasterService';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { Loader } from '../../../Basic/components';
import { useGetStateQuery } from '../../../redux/services/StateMasterService';
import { useAddQuotesMutation, useDeleteQuotesMutation, useGetQuotesByIdQuery, useGetQuotesQuery, useUpdateQuotesMutation } from '../../../redux/services/QuotesService';


import LeadPageForm from './LeadPageForm';
import LeadPageFormReport from './LeadPageFormReport';
import LeadBoard from '../LeadBoard';
import Party from '../../../HostelStore/Components/PartyMaster';
import { useGetLeadQuery } from '../../../redux/services/LeadFormService';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';


const MODEL = "Lead";
export default function Form() {
  const today = new Date()
  const [id, setId] = useState("")
  const [docId, setDocId] = useState("");
  const [formReport, setFormReport] = useState(false)
  const [readOnly, setReadOnly] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [leadPageOpen, setLeadPageOpen] = useState(false)
  const [partyFormOpen, setPartyFormOpen] = useState(false)
  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )


  const openTabs = useSelector((state) => state.openTabs);



  const dispatch = useDispatch()



  const userId = {
    userId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId"
    ),
  };

  const { data: partyList } = useGetPartyQuery({ params })
  const { data: stateList } = useGetStateQuery({ params })
  const { data: uomList } = useGetUomQuery({ params })
  const { data: allData, isLoading, isFetching } = useGetLeadQuery({ params: { branchId }, searchParams: searchValue });


  function getNextDocId() {
    if (id || isLoading || isFetching) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }





  const onNew = () => {
    setId("");

    setReadOnly(false);
    setSearchValue("");
    setLeadPageOpen(true);
    getNextDocId()
  }

  if (!partyList || !uomList || !stateList) return <Loader />

  const isLead = true;
  if (partyFormOpen)
    return (
      <Party
        setPartyFormOpen={setPartyFormOpen}
        setLeadPageOpen={setLeadPageOpen}
        leadPageOpen={leadPageOpen}
        isLead={isLead}
      />
    );


  return (
    <div className='md:items-start md:justify-items-center grid min-h-screen bg-theme'>

      <Modal
        isOpen={leadPageOpen}
        widthClass={"px-2 h-[80%] w-[60%]"}
      >
        <LeadPageForm searchValue={searchValue} setSearchValue={setSearchValue} setReadOnly={setReadOnly}
          readOnly={readOnly} id={id} setId={setId} setLeadPageOpen={setLeadPageOpen} partyFormOpen={partyFormOpen}
          setPartyFormOpen={setPartyFormOpen} onClick={() => { setLeadPageOpen(false); }} getNextDocId={() => getNextDocId()}
          setDocId={setDocId} docId={docId} />
      </Modal>
      <Modal
        isOpen={formReport}
        onClose={() => setFormReport(false)}
        widthClass={"px-2 h-[90%] w-[90%]"}
      >
        <LeadPageFormReport onClick={(id) => { setId(id); setFormReport(false); setLeadPageOpen(true) }} />
      </Modal>
      <div className='flex flex-col frame w-full min-h-full'>
        <FormHeader
          onNew={onNew}
          model={MODEL}
          openReport={() => setFormReport(true)}
        />
        <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
          <div className='col-span-4 grid md:grid-cols-1 border overflow-auto'>
            <div className='mr-1 md:ml-2'>
              <LeadBoard onClick={(id) => { setId(id); setLeadPageOpen(true) }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import useOutsideClick from '../../../../src/CustomHooks/handleOutsideClick'
import { useDispatch } from "react-redux";
import { useGetPartyQuery, useAddPartyMutation, useGetPartyByIdQuery, useUpdatePartyMutation } from '../../../redux/services/PartyMasterService';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { findFromList } from '../../../Utils/helper';



const ContactPersonSearch = ({ setContactPersonName, contactPersonName, name = null, clientId, setContact, search, setSearch, readOnly }) => {
    const [isListShow, setIsListShow] = useState(false)
    const inputRef = useOutsideClick(() => { setIsListShow(false) })
    const [filteredPages, setFilteredPages] = useState([])

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"

    )
    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId")

    const {
        data: singlePartyData,

    } = useGetPartyByIdQuery(clientId, { skip: (!clientId) });



    const { data: partyList, isLoading: isPartyLoading, isFetching: isPartyFetching } = useGetPartyQuery({ params: { companyId, userId } })

    // const [addData] = useAddPartyMutation();
    const [updateData] = useUpdatePartyMutation();

    useEffect(() => {
        let pageSearchComponent = document.getElementById("pageSearch");
        if (!pageSearchComponent) return
        pageSearchComponent.addEventListener('keydown', function (ev) {
            var focusableElementsString = '[tabindex="0"]';
            let ol = document.querySelectorAll(focusableElementsString);
            if (ev.key === "ArrowDown") {
                for (let i = 0; i < ol.length; i++) {
                    if (ol[i] === ev.target) {
                        let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
                        o.focus(); break;
                    }
                }
                ev.preventDefault();
            } else if (ev.key === "ArrowUp") {
                for (let i = 0; i < ol.length; i++) {
                    if (ol[i] === ev.target) {
                        let o = ol[i - 1];
                        o.focus(); break;
                    }
                }
                ev.preventDefault();
            }
        });
        return () => {
            pageSearchComponent.removeEventListener('keydown', () => { });
        };
    }, []);



    useEffect(() => {
        if (!partyList) return
        if (!search) { setFilteredPages(partyList.data?.contactDetails) }
        // setFilteredPages(partyList.data.filter(page => page.name.toLowerCase().includes(search.toLowerCase())))
        setFilteredPages(singlePartyData?.data?.contactDetails || [])
    }, [search, partyList, isPartyFetching, isPartyLoading])



    const handleAddNewParty = async () => {
        let response = await updateData({ id: clientId, body: { isContactOnly: true, contactPersonName: search, userId, companyId, contactDetails: [...filteredPages, { contactPersonName: search, email: "", mobileNo: "" }] } }).unwrap();
        let index = singlePartyData?.data?.contactDetails?.length - 1
        setContactPersonName(search)
    }


    if (!partyList) return <Loader />

    return (
        <div id='pageSearch' className='relative flex flex-col text-black z-10 w-full' ref={inputRef}>
            <div className='grid grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1 data gap-1'>
                <label className={`md:text-start flex`} >{name}</label>{console.log(readOnly, "readOnly", contactPersonName, "contactpersonnn")}



                {
                    readOnly ?
                        <div className={`text-left p-1 w-[204px] h-6 focus:outline-none border-gray-500 border rounded`}>
                            {contactPersonName}
                        </div>
                        :
                        <div className='col-span-2'>{console.log(filteredPages, "filteredPages")}
                            {isListShow ?
                                < input type="text" className={`input-field focus:outline-none border-gray-500 border rounded`}
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value) }}
                                    onFocus={() => { setIsListShow(true) }}
                                    tabIndex={0}
                                />
                                :
                                <input type="text" className={`input-field focus:outline-none border-gray-500 border rounded`}
                                    // value={singlePartyData?.data?.contactDetails?.find(val => val.contactPersonName == contactPersonName)}
                                    value={contactPersonName}
                                    tabIndex={0}
                                    onFocus={() => { setIsListShow(true) }}
                                />
                            }
                            {isListShow &&
                                <ul className='absolute max-h-[300px] overflow-auto top-7 bg-gray-200 w-[200px]'>
                                    {search &&
                                        <li
                                            tabIndex={0}
                                            className="cursor-pointer"

                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleAddNewParty()
                                                    setSearch("");
                                                    setIsListShow((false));
                                                }
                                            }}
                                            onClick={() => {

                                                handleAddNewParty();

                                                setSearch(""); setIsListShow((false));
                                            }}
                                        >Create Party {`"${search}"`}</li>
                                    }
                                    {filteredPages.map((party) => <li className='cursor-pointer hover:bg-blue-500'
                                        key={party.contactPersonName}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                setContactPersonName(party.contactPersonName)
                                                setSearch("");
                                                setIsListShow((false));
                                            }
                                        }}
                                        onClick={() => { setContactPersonName(party.contactPersonName); setSearch(""); setIsListShow((false)); }} > <pre> {party.contactPersonName} </pre></li>)}
                                </ul>
                            }
                        </div>
                }





            </div>
        </div>
    )
}

export default ContactPersonSearch

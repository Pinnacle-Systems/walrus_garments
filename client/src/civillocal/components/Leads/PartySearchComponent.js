import React, { useEffect, useState } from 'react'
import useOutsideClick from '../../../../src/CustomHooks/handleOutsideClick'
import { useDispatch } from "react-redux";
import { useGetPartyQuery, useAddPartyMutation } from '../../../redux/services/PartyMasterService';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { findFromList } from '../../../Utils/helper';



const PartySearchComponent = ({ setPartyId, partyId, name = null, readOnly, id }) => {
    const [isListShow, setIsListShow] = useState(false)
    const inputRef = useOutsideClick(() => { setIsListShow(false) })
    const [filteredPages, setFilteredPages] = useState([])
    const [search, setSearch] = useState("");

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"

    )
    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )
    const { data: partyList, isLoading: isPartyLoading, isFetching: isPartyFetching } = useGetPartyQuery({ params: { companyId, userId } })

    const [addData] = useAddPartyMutation();

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
        if (!search) { setFilteredPages(partyList.data) }
        setFilteredPages(partyList.data.filter(page => page.name.toLowerCase().includes(search.toLowerCase())))
    }, [search, partyList, isPartyFetching, isPartyLoading])

    const handleAddNewParty = async () => {
        let response = await addData({ name: search, companyId, userId }).unwrap()
        setPartyId(response.data.id)
    }

    if (!partyList) return <Loader />

    return (
        <div id='pageSearch' className='relative flex flex-col text-black z-10 w-full' ref={inputRef}>
            <div className='grid grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1 data gap-1'>
                <label className={`md:text-start flex`} >{name} <span className='text-red-600'>*</span></label>


                {
                    id ?
                        <div className={`text-left  p-1 w-[204px] h-6 focus:outline-none border-gray-500 border rounded`}>
                            {findFromList(partyId, partyList ? partyList.data : [], "name")}
                        </div>
                        :
                        <div className='col-span-2'>
                            {isListShow ?
                                <input type="text" readOnly={readOnly} className={`input-field focus:outline-none border-gray-500 border rounded`}
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value) }}
                                    onFocus={() => { setIsListShow(true) }}
                                    tabIndex={0}
                                />
                                :
                                <input type="text" readOnly={readOnly}
                                    className={`input-field focus:outline-none border-gray-500 border rounded`}
                                    value={findFromList(partyId, partyList ? partyList.data : [], "name")}
                                    tabIndex={0}
                                    onFocus={() => { setIsListShow(true) }}
                                />
                            }
                            {isListShow &&
                                <ul className='absolute max-h-[300px] overflow-auto top-7 bg-gray-200 w-[200px]'>
                                    {search &&
                                        <li
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleAddNewParty()
                                                    setSearch("");
                                                    setIsListShow((false));
                                                }
                                            }}
                                            onClick={() => {
                                                handleAddNewParty()
                                                setSearch(""); setIsListShow((false));
                                            }}
                                        >Create Party {`"${search}"`}</li>
                                    }
                                    {filteredPages.map((party) => <li className='cursor-pointer hover:bg-blue-500'
                                        key={party.id}

                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                setPartyId(party.id)
                                                setSearch("");
                                                setIsListShow((false));
                                            }
                                        }}
                                        onClick={() => { setPartyId(party.id); setSearch(""); setIsListShow((false)); }} > <pre> {party.name}/ {party?.address || ""}</pre></li>)}
                                </ul>
                            }
                        </div>

                }









            </div>
        </div>
    )
}

export default PartySearchComponent

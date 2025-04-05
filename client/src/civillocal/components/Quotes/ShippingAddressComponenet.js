import React, { useEffect, useState } from 'react'
import useOutsideClick from '../../../../src/CustomHooks/handleOutsideClick'
import { useDispatch } from "react-redux";
import { useGetPartyQuery, useAddPartyMutation, useGetPartyByIdQuery } from '../../../redux/services/PartyMasterService';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { findFromList } from '../../../Utils/helper';



const ShippingAddressComponent = ({ shippingAddress, setShippingAddress, name = null, clientId, isDifferAddress, billingId }) => {
    const [isListShow, setIsListShow] = useState(false)
    const inputRef = useOutsideClick(() => { setIsListShow(false) })
    const [filteredPages, setFilteredPages] = useState([])
    const [search, setSearch] = useState("");

    const {
        data: singlePartyData,

    } = useGetPartyByIdQuery(isDifferAddress ? billingId : clientId, { skip: (!clientId) });



    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"

    )
    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )



    // const [addData] = useAddPartyMutation();

    // useEffect(() => {
    //     let pageSearchComponent = document.getElementById("pageSearch");
    //     if (!pageSearchComponent) return
    //     pageSearchComponent.addEventListener('keydown', function (ev) {
    //         var focusableElementsString = '[tabindex="0"]';
    //         let ol = document.querySelectorAll(focusableElementsString);
    //         if (ev.key === "ArrowDown") {
    //             for (let i = 0; i < ol.length; i++) {
    //                 if (ol[i] === ev.target) {
    //                     let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
    //                     o.focus(); break;
    //                 }
    //             }
    //             ev.preventDefault();
    //         } else if (ev.key === "ArrowUp") {
    //             for (let i = 0; i < ol.length; i++) {
    //                 if (ol[i] === ev.target) {
    //                     let o = ol[i - 1];
    //                     o.focus(); break;
    //                 }
    //             }
    //             ev.preventDefault();
    //         }
    //     });
    //     return () => {
    //         pageSearchComponent.removeEventListener('keydown', () => { });
    //     };
    // }, []);



    useEffect(() => {
        if (!singlePartyData) return
        // if (!search) { setFilteredPages(singlePartyData.data.ShippingAddress) }
        setFilteredPages(singlePartyData?.data?.ShippingAddress || [])
    }, [singlePartyData])

    // const handleAddNewParty = async () => {
    //     let response = await addData({ name: search, companyId, userId }).unwrap()
    //     setPartyId(response.data.id)
    // }

    if (!singlePartyData) return <Loader />

    return (
        <div id='pageSearch' className='relative flex flex-col text-black z-10 w-full' ref={inputRef}>
            <div className='grid grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1 data gap-1'>
                <label className={`md:text-start flex`} >{name} <span className='text-red-600'>*</span></label>
                <div className='col-span-2'>
                    {isListShow ?
                        <input type="text" className={`input-field focus:outline-none border-gray-500 border rounded`}
                            value={search}
                            onChange={(e) => { setSearch(e.target.value.toUpperCase()) }}
                            onFocus={() => { setIsListShow(true) }}
                            tabIndex={0}
                        />
                        :
                        <input type="text" className={`input-field focus:outline-none border-gray-500 border rounded`}
                            // value={findFromList(partyId, partyList ? partyList.data : [], "name")}
                            value={shippingAddress}
                            tabIndex={0}
                            onFocus={() => { setIsListShow(true) }}
                        />
                    }
                    {isListShow &&
                        <ul className='absolute max-h-[300px] overflow-auto top-7 bg-gray-200 w-[200px]'>
                            {/* {search &&
                                <li
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            // handleAddNewParty()
                                            setSearch("");
                                            setIsListShow((false));
                                        }
                                    }}
                                    onClick={() => {
                                        // handleAddNewParty()
                                        setSearch(""); setIsListShow((false));
                                    }}
                                >Create Party {`"${search}"`}</li>
                            } */}
                            {filteredPages.map((party) => <li className='cursor-pointer hover:bg-blue-500'
                                key={party.address}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setShippingAddress(party.address)
                                        setSearch("");
                                        setIsListShow((false));
                                    }
                                }}
                                onClick={() => { setShippingAddress(party.address); setSearch(""); setIsListShow((false)); }} > <pre> {party.address} </pre></li>)}
                        </ul>
                    }
                </div>
            </div>
        </div>
    )
}

export default ShippingAddressComponent

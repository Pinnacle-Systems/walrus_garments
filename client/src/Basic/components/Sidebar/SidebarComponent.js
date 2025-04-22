import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { push } from "../../../redux/features/opentabs";
import { useNavigate } from "react-router-dom";
import { Gamepad2, HandCoins, LayoutDashboard, Search, University, Volleyball } from "lucide-react";
// import { GrUserWorker } from "react-icons/gr";
import { TfiWorld } from "react-icons/tfi";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineMyLocation } from "react-icons/md";
import { TbCalendarDollar } from "react-icons/tb";
import { LuUserCheck } from "react-icons/lu";
import { BiCategoryAlt } from "react-icons/bi";
import { MdCurrencyRupee } from "react-icons/md";
import { IoColorPaletteOutline } from "react-icons/io5";
import { TbRulerMeasure2 } from "react-icons/tb";
import { HiOutlineReceiptTax } from "react-icons/hi";
import { HiReceiptTax } from "react-icons/hi";
import { PiTShirtThin } from "react-icons/pi";
import { FaMapLocationDot } from "react-icons/fa6";
import { PiSock } from "react-icons/pi";
import { PiSockFill } from "react-icons/pi";
// import { MdWifiProtectedSetup } from "react-icons/md";
// import { LuProportions } from "react-icons/lu";
import { BsQuestionOctagon } from "react-icons/bs";
import { FaCottonBureau } from "react-icons/fa6";
import { GiYarn } from "react-icons/gi";
import { PiYarnLight } from "react-icons/pi";
// import { GiRolledCloth } from "react-icons/gi";
// import { SiGsmarenadotcom } from "react-icons/si";
// import { AiOutlineNumber } from "react-icons/ai";
// import { PiScribbleLoopBold } from "react-icons/pi";
// import { MdDesignServices } from "react-icons/md";
import { FaSocks } from "react-icons/fa6";
import { GiFoldedPaper } from "react-icons/gi";
import { TbNeedleThread } from "react-icons/tb";

import country from './images/flag.png';
import material from './images/style.png'
import employee from "./images/employee.png";
import state from "./images/map.png";
import city from "./images/city.png";
import department from "./images/department.png";
import calender from "./images/calender.png";
import empcategory from "./images/empcategory.png";
import partycategory from "./images/partycategory.png";
import currency from "./images/currency.png";
import party from "./images/party.png";
import color from "./images/color.png";
import payterm from "./images/payterm.png"
import taxterm from "./images/tax.png";
import taxtemplate from "./images/taxtemplate.png";
import size from "./images/size.png";
import style from "./images/style.png";
import location from "./images/location.png";
import sizetemplate from "./images/sizetemplate.png";
import lossreason from "./images/reason.png";
import yarncontent from "./images/cotton.png";
import yarntype from "./images/yarntype.png";
import yarnblend from "./images/yarnblend.png";
import yarn from "./images/yarn.png";
import yarncount from "./images/yarncount.png";
import accessorygroup from "./images/accessorygroup.png";
import accessory from "./images/accessory.png";
import accessoryitem from "./images/accessoryitem.png"
import Machine from "./images/Machine.jpeg";
import { useGetPageGroupQuery } from "../../../redux/services/PageGroupMasterServices";
import axios from "axios";
import { MachineMaster } from "..";


const SidebarComponent = ({ logo, groups, pages, isMainDropdownOpen, setIsMainDropdownOpen, heading, setIsOpen }) => {
    const dispatch = useDispatch();

    const [hoveredGroupId, setHoveredGroupId] = useState(null);
    const navigate = useNavigate();


    const [search, setSearch] = useState("");

    const filteredData = pages.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const iconMapping = {
        "COUNTRY MASTER":
            <img src={country} alt="country" className="w-[23px]  justify-center items-center bg-white rounded border-2 border-white shadow" />
        ,
        "EMPLOYEE MASTER":
            <img src={employee} alt="country" className="w-[23px]  justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "STATE MASTER":
            <img src={state} alt="country" className="w-[23px]  justify-center items-center  bg-white border-2 border-white rounded shadow" />
        ,
        "CITY MASTER":
            <img src={city} alt="country" className="w-[23px]  justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "DEPARTMENT MASTER":
            <img src={department} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "FIN YEAR MASTER":
            <img src={calender} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "EMPLOYEE CATEGORY MASTER":
            <img src={empcategory} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "PARTY MASTER":
            <img src={party} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "PARTY CATEGORY MASTER":
            <img src={partycategory} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "CURRENCY MASTER":
            <img src={currency} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "COLOR MASTER":
            <img src={color} alt="country" className="w-[23px] flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "UNIT OF MEASUREMENT MASTER": <img />,
        "PAY TERM MASTER":
            <img src={payterm} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "TAX TERM MASTER":
            <img src={taxterm} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        //  <HiOutlineReceiptTax size={20} />
        ,
        "TAX TEMPLATE":
            <img src={taxtemplate} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        //  <HiReceiptTax size={20} />
        ,
        "SIZE MASTER":
            <img src={size} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        // <PiSock size={20} />
        ,
        "SIZE TEMPLATE MASTER":
            <img src={sizetemplate} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        // <TbRulerMeasure2 size={20} />
        ,
        "LOCATION MASTER":
            <img src={location} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        // <IoLocationOutline size={20} />
        ,
        "STYLE MASTER":
            <img src={style} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        // <PiSockFill size={20} />
        ,
        "PROCESS MASTER":
            <span className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow">
                <img />
            </span>
        //  <MdWifiProtectedSetup size={20} /> 
        ,
        "PORTION MASTER": <img />,
        "LOSS REASON MASTER":
            <img src={lossreason} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        // <BsQuestionOctagon size={20} />
        ,
        "CONTENT MASTER":
            <img src={yarncontent} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        // <FaCottonBureau size={20} />
        ,
        "YARN TYPE MASTER":
            <img src={yarntype} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        // <GiYarn size={20} />
        ,
        "YARN MASTER":
            <img src={yarn} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        // <Volleyball size={20} />
        ,
        "YARN BLEND MASTER":
            <img src={yarnblend} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        // <PiYarnLight size={20} />
        ,
        "FABRIC TYPE MASTER": <img />,
        "GSM MASTER": <img />,
        "GAUGE MASTER": <img />,
        "LOOP LENGTH MASTER": <img />,
        "DESIGN MASTER": <img />,
        "ACCESSORY ITEM MASTER":
            <img src={accessoryitem} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "ACCESSORY MASTER":
            <img src={accessory} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "COUNTS MASTER":
            <img src={yarncount} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "ACCESSORY GROUP MASTER":
            <img src={accessorygroup} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "SHOCKS MATERIAL MASTER":
        <img src={material} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
    ,
        "MACHINE MASTER":
            <img src={Machine} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
    }
    return (
        <div
            className="fixed top-[16.5%] left-[87px] z-50"
        >

            {isMainDropdownOpen === true ? <div onClick={() => setIsMainDropdownOpen(false)} className="bg-gray-600 opacity-40 fixed top-0 left-0 right-0 bottom-0 -z-10 "
            ></div> : ""}


            {/* Main Dropdown */}
            {isMainDropdownOpen === true && (
                <div className=" ">

                    <div className=" bg-white p-2 outline outline-gray-500 shadow-lg  rounded-lg   overflow-auto h-[400px] transition duration-100">
                        <div className='flex items-center text-[11px] border rounded-full relative  w-full'>
                            <input className=' px-2 py-1 w-full text-[12px] rounded-full'
                                placeholder='search'
                                type='text'
                                name='masters'
                                value={search}
                                onChange={(e) => setSearch(e.target.value)} />
                            <div className='absolute right-2  text-neutral-500'>
                                <Search size={15} />
                            </div>
                        </div>
                        <ul className="w-full p-0 transition duration-150 ease-in-out origin-top   ">

                            {groups && groups.map((group) => (
                                <li
                                    key={group?.id}
                                    className="rounded-md relative my-0"
                                // onMouseEnter={() => setHoveredGroupId(group.id)}
                                // onMouseLeave={() => setHoveredGroupId(null)}
                                >
                                    {/* Sub-Dropdown Trigger */}
                                    <div className={`w-full text-[11px] text-left  items-center  rounded cursor-default`} >
                                        {search.length > 0 ? "" : <div className="text-[14px] font-semibold ml-2.5 text-gray-800 mt-2">{(group?.name + " MASTERS").toLowerCase().replace(/\b[a-z]/g, char => char.toUpperCase())}</div>}

                                        <ul
                                            className=" grid grid-cols-3  rounded-xl left-full  transition-all duration-200 ease-in-out origin-top-left z-50 w-56  px-0 pt-0 pb-3"
                                        // onMouseEnter={() => setHoveredGroupId(group.id)}
                                        // onMouseLeave={() => setHoveredGroupId(null)}
                                        >

                                            {filteredData
                                                .filter(
                                                    (page) =>
                                                        parseInt(page.pageGroupId) === parseInt(group.id)
                                                )
                                                .map((page) => (<>
                                                    <li
                                                        key={page.id}
                                                        onClick={() => {
                                                            dispatch(push(page));
                                                            secureLocalStorage.setItem(
                                                                sessionStorage.getItem("sessionId") + "currentPage",
                                                                page?.id
                                                            );
                                                            // navigate(page.type)
                                                            setIsMainDropdownOpen(false)
                                                            setIsOpen(false)
                                                        }}
                                                        className={`rounded-md text-[9px]  relative flex justify-center items-center  cursor-pointer    text-gray-800
                                                          hover:text-[black] hover:bg-gray-300
                                                          transition duration-100  my-0 h-[60px]`}
                                                    >

                                                        <div className="flex flex-col align-middle text-center justify-center">
                                                            <div className="w-full flex justify-center mb-0.5 ">
                                                                {/* <Gamepad2 size={20} /> */}
                                                                {iconMapping[page?.name] || <img />}

                                                            </div>
                                                            <div className="">
                                                                {page?.name.replace(/\bMASTER\b/g, "").trim().toLowerCase().replace(/\b[a-z]/g, char => char.toUpperCase())}
                                                            </div>
                                                        </div>

                                                    </li></>

                                                ))}
                                        </ul>


                                    </div>



                                </li>
                            ))}
                        </ul>

                    </div>
                </div>

            )}
        </div>
    );
};
export default SidebarComponent;

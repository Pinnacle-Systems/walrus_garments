import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutDashboard, PanelLeftClose, PanelRightClose, Settings, Table, UserRoundPen, FileChartColumn } from 'lucide-react';
import './Sidebar.css';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import { PAGES_API, ROLES_API } from '../../../Api';
import { ArrowRightCircle, ArrowLeftCircle } from "lucide-react";
import axios from 'axios';
import { useGetPageGroupQuery } from '../../../redux/services/PageGroupMasterServices';
// import MultiLevelDropDown from '../MultiSelectDropDown';
import SidebarComponent from './SidebarComponent';
// import logo from "../../assets/pinnacle.png";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import Swal from 'sweetalert2';

const BASE_URL = process.env.REACT_APP_SERVER_URL;

// const Sidebar = ({ isOpen, setIsOpen, isMainDropdownOpen, setIsMainDropdownOpen }) => {

//   const navigate = useNavigate()


//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const [hideNavBar, sethideNavBar] = useState(true);

//   const navBatItemsStyle = hideNavBar ? "hidden" : "";

//   const [allowedPages, setAllowedPages] = useState([]);

//   const [heading, setHeading] = useState("");


//   const { data: pageGroup } = useGetPageGroupQuery({ searchParams: "" })

//   const toggleNavMenu = () => {
//     sethideNavBar(!hideNavBar);
//   };

//   // const defaultAdmin = JSON.parse(
//   //   secureLocalStorage.getItem(
//   //     sessionStorage.getItem("sessionId") + "defaultAdmin"
//   //   )
//   // );

//   const retrieveAllowedPages = useCallback(() => {
//     if (
//       JSON.parse(
//         secureLocalStorage.getItem(
//           sessionStorage.getItem("sessionId") + "defaultAdmin"
//         )
//       )
//     ) {
//       axios({
//         method: "get",
//         url: BASE_URL + PAGES_API,
//         params: { active: true },
//       }).then(
//         (result) => {
//           console.log("result", result.data.data);
//           setAllowedPages(result.data.data);
//         },
//         (error) => {
//           console.log(error);
//           toast.error("Server Down", { autoClose: 5000 });
//         }
//       );
//     } else {
//       axios({
//         method: "get",
//         url:
//           BASE_URL +
//           ROLES_API +
//           `/${secureLocalStorage.getItem(
//             sessionStorage.getItem("sessionId") + "userRoleId"
//           )}`,
//       }).then(
//         (result) => {
//           if (result.status === 200) {
//             if (result.data.statusCode === 0) {
//               setAllowedPages(
//                 result.data.data.RoleOnPage.filter(
//                   (page) => page.page.active && page.read
//                 ).map((page) => {
//                   return {
//                     name: page.page.name,
//                     type: page.page.type,
//                     link: page.page.link,
//                     id: page.page.id,
//                     pageGroupId: page.page.pageGroupId
//                   };
//                 })
//               );
//             }
//           } else {
//             console.log(result);
//           }
//         },
//         (error) => {
//           console.log(error);
//           toast.error("Server Down", { autoClose: 5000 });
//         }
//       );
//     }
//   }, []);

//   useEffect(retrieveAllowedPages, [retrieveAllowedPages]);
//   const hideExpireWarning = () => {
//     let expireWarningDiv = document.getElementById("expireWarning");
//     expireWarningDiv.style.display = "none";
//   };

//   function findElement(id, arr) {
//     if (!arr) return ""
//     let data = arr.find(item => parseInt(item.id) === parseInt(id))
//     return data ? data.name : ""
//   }

//   const masters = allowedPages.filter((page) => page.type === "Masters")
//   const mastersGroup = [...new Set(masters.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
//   const transactions = allowedPages.filter((page) => page.type === "Transactions")
//   const transactionsGroup = [...new Set(transactions.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
//   const reports = allowedPages.filter((page) => page.type === "Reports")
//   const reportGroups = [...new Set(reports.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })




//   const headers = [

//     {
//       heading: 'Masters',
//       logo: <Table size={20} />,
//       groups: mastersGroup,
//       pages: masters
//     },
//     // {
//     //   heading: 'Transactions',
//     //   logo: <UserRoundPen size={20} />,
//     //   groups: transactionsGroup,
//     //   pages: transactions
//     // },
//     // {
//     //     heading: 'Users',
//     //     logo: <UsersRound />
//     // },
//     // {
//     //     heading: 'Settings',
//     //     logo: <Settings />
//     // },
//     // {
//     //     heading: 'Profile',
//     //     logo: <UserRoundPen />
//     // },
//   ]
//   return (
//     <>
//       <div onClick={() => {
//         if (isOpen && isMainDropdownOpen) {
//           setIsOpen(false);
//           setIsMainDropdownOpen(false)
//         }
//         setIsOpen(!isOpen)
//       }
//       } className='fixed z-[99] top-[16.5%]  bg-gray-600 opacity-50 px-0 h-[10%] flex items-center rounded-end cursor-pointer' >
//         <div className='text-white'>{isOpen ? <ChevronLeft style={{ width: '12px' }} /> : <ChevronRight style={{ width: '12px' }} />}</div>
//       </div>
//       {isOpen && <div className={`sidebar  w-[60px] ${isMainDropdownOpen ? "h-[400px]" : ""} bg-[#495057] top-[16.5%] left-[1%] fixed z-[999] rounded-lg flex justify-center py-3`}>


//         {/* <div className={`sidebar-header`}>
//                 Logo
//                 {isOpen && <img
//                     src={logo} // Replace with your logo URL
//                     alt="Logo"
//                     className="sidebar-logo"
//                 />}

//                 Toggle Button
//                 <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
//                     {isOpen ? <PanelLeftClose size={20} /> : <PanelRightClose size={20} />}
//                 </button>
//             </div> */}

//         {/* Navigation / Sidebar Content */}
//         <div className=" ">
//           <div className='text-white hover:text-gray-400 cursor-pointer mb-3'>
//             <a className=' mx-auto text-light flex justify-center hover:text-gray-400 ' type="button" ><LayoutDashboard size={20} /></a>
//             <div className='text-[9px] '>Dashboard</div>
//           </div>
//           {/* Main Dropdown Trigger */}
//           {headers.map((ele, index) => {
//             return (

//               <div
//                 key={index}
//                 onClick={() => setIsMainDropdownOpen(!isMainDropdownOpen)}
//                 className="text-white w-full cursor-pointer mt-2">

//                 <a className=" cursor-pointer text-white flex justify-center">{ele.logo}</a>
//                 <div className="text-[9px] text-center ">{ele.heading}</div>
//               </div>

//             )
//           })}

//         </div>


//       </div>}

//       <div className="my-0 ">

//         <ul className='my-0 flex flex-col '>


//           {headers.map((ele, index) => {

//             return (
//               <div key={index}>
//                 <li >
//                   <SidebarComponent setIsOpen={setIsOpen} heading={ele.heading} logo={ele.logo}
//                     groups={ele.groups} pages={ele.pages} isMainDropdownOpen={isMainDropdownOpen} setIsMainDropdownOpen={setIsMainDropdownOpen} />
//                   <a className='relative group' href={ele.path} type="button" >{ele.logo}</a>

//                 </li>
//               </div>
//             )
//           })}

//         </ul>

//       </div>
//     </>
//   )
// }

const Sidebar = ({ isOpen, setIsOpen, isMainDropdownOpen, setIsMainDropdownOpen }) => {

  const navigate = useNavigate()

  const [name, setName] = useState("");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [hideNavBar, sethideNavBar] = useState(true);

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const [allowedPages, setAllowedPages] = useState([]);

  const { data: pageGroup } = useGetPageGroupQuery({ searchParams: "" })

  console.log("pageGroup", pageGroup);

  const toggleNavMenu = () => {
    sethideNavBar(!hideNavBar);
  };

  // const defaultAdmin = JSON.parse(
  //   secureLocalStorage.getItem(
  //     sessionStorage.getItem("sessionId") + "defaultAdmin"
  //   )
  // );

  const retrieveAllowedPages = useCallback(() => {
    if (
      JSON.parse(
        secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "defaultAdmin"
        )
      )
    ) {
      axios({
        method: "get",
        url: BASE_URL + PAGES_API,
        params: { active: true },
      }).then(
        (result) => {
          console.log("result", result.data.data);
          setAllowedPages(result.data.data);
        },
        (error) => {
          console.log(error);
          Swal.fire({
            title: "Server Down",
            icon: "error",

          });
        }
      );
    } else {
      axios({
        method: "get",
        url:
          BASE_URL +
          ROLES_API +
          `/${secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userRoleId"
          )}`,
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              setAllowedPages(
                result.data.data.RoleOnPage.filter(
                  (page) => page.page.active && page.read
                ).map((page) => {
                  return {
                    name: page.page.name,
                    type: page.page.type,
                    link: page.page.link,
                    id: page.page.id,
                    pageGroupId: page.page.pageGroupId,
                    active: page.page.active
                  };
                })
              );
            }
          } else {
            console.log(result);
          }
        },
        (error) => {
          console.log(error);
          Swal.fire({
            title: "Server Down",
            icon: "error",

          });
        }
      );
    }
  }, []);

  useEffect(retrieveAllowedPages, [retrieveAllowedPages]);
  const hideExpireWarning = () => {
    let expireWarningDiv = document.getElementById("expireWarning");
    expireWarningDiv.style.display = "none";
  };

  function findElement(id, arr) {
    if (!arr) return ""
    let data = arr.find(item => parseInt(item.id) === parseInt(id))
    return data ? data.name : ""
  }

  const masters = allowedPages.filter((page) => page.type === "Masters")
  const mastersGroup = [...new Set(masters.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data), type: "Master" } })
  const transactions = allowedPages?.filter((page) => page.type === "Transactions" && page.active)
  console.log(transactions, "transactions")
  const transactionsGroup = [...new Set(transactions.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data), type: "Module" } })
  const reports = allowedPages.filter((page) => page.type === "Reports")
  const reportGroups = [...new Set(reports.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data), } })
  console.log(transactionsGroup, "transactionsGroup")


  console.log(allowedPages, "allowedPages")

  const order = [
    "PO",
    "STOCK",
    "SALES",
    "PAYMENTS"
  ];

  const sorted = order.map(name => transactionsGroup?.find(item => item.name === name))
    .filter(Boolean);

  console.log(sorted, "sorted");

  const headers = [

    {
      heading: 'Masters',
      logo: <Table size={24} />,
      groups: mastersGroup,
      pages: masters,
      type: "Master"

    },
    {
      heading: 'Transactions',
      logo: <PanelLeftClose size={24} />,
      groups: sorted,
      pages: transactions,
      type: "Module"
    },
    {
      heading: 'Reports',
      logo: <FileChartColumn size={24} />,
      groups: reportGroups,
      pages: reports
    },
  ]

  const dispatch = useDispatch();

  return (
    <>
      {/* Toggle Button */}
      <div
        onClick={() => {
          if (isOpen && isMainDropdownOpen) {
            setIsOpen(false);
            setIsMainDropdownOpen(false);
          }
          setIsOpen(!isOpen);
        }}
        className="fixed z-[99] top-[20%] left-0 bg-gradient-to-r from-gray-700 to-gray-600 text-white w-8 h-12 flex items-center justify-center rounded-r-xl shadow-xl cursor-pointer transition-all duration-300 hover:from-gray-800 hover:to-gray-700 hover:scale-105"
      >
        {isOpen ? (
          <ArrowLeftCircle size={22} className="text-white transition-all duration-300" />
        ) : (
          <ArrowRightCircle size={22} className="text-white transition-all duration-300" />
        )}
      </div>


      {isOpen && (
        <div
          className={`fixed z-[999] top-[16.5%] left-[1.5rem] bg-[#343a40] text-white w-[72px] ${isMainDropdownOpen ? "h-[450px]" : "h-auto"
            } rounded-lg py-4 flex flex-col items-center shadow-xl transition-all duration-300`}
        >
          {/* <div
            className="text-white hover:text-gray-300 cursor-pointer mb-4 flex flex-col items-center"

            onClick={(() => {
              dispatch(push(
                {
                  active: true,
                  name: "DASHBOARD",
                }

              ));
            })}>
            <LayoutDashboard size={20} />
            <span className="text-[11px] text-center mt-1">Dashboard</span>
          </div> */}

          {headers.map((ele, index) => (
            <div
              key={index}
              onClick={() => {
                setIsMainDropdownOpen(true);
                setName(ele.heading);
              }}
              className="hover:text-gray-300 cursor-pointer my-3 flex flex-col items-center transition"
            >
              {ele.logo}
              <span className="text-[11px] text-center mt-1">{ele.heading}</span>
            </div>
          ))}
        </div>
      )}

      <div className="my-0 ">

        <ul className='my-0 flex flex-col '>


          {headers.map((ele, index) => {
            return (
              <div key={index}>
                <li >
                  {name === ele.heading && <SidebarComponent setIsOpen={setIsOpen} heading={ele.heading} logo={ele.logo} groups={ele.groups} pages={ele.pages} isMainDropdownOpen={isMainDropdownOpen} setIsMainDropdownOpen={setIsMainDropdownOpen} />}

                  {/* <a className='relative group' href={ele.path} type="button" >{ele.logo}</a> */}
                  {/* Tooltip */}
                </li>
              </div>
            )
          })}

        </ul>

      </div>

    </>

  )
}

export default Sidebar

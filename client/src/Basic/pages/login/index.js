// import React from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { PRODUCT_ADMIN_HOME_PATH } from "../../../Route/urlPaths";
// import { LOGIN_API } from "../../../Api";
// import Loader from "../../components/Loader";
// import { generateSessionId } from "../../../Utils/helper";
// import secureLocalStorage from "react-secure-storage";
// import Modal from "../../../UiComponents/Modal";
// import { BranchAndFinyearForm } from "../../components";
// import buildingLogo from "../../../assets/final-logo_page-0001.png"
// const BASE_URL = process.env.REACT_APP_SERVER_URL;

// const Login = () => {
//   const [isGlobalOpen, setIsGlobalOpen] = useState(false);

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [planExpirationDate, setPlanExpirationDate] = useState("");
//   const navigate = useNavigate();

//   const data = { username, password };

//   const loginUser = (e) => {
//     e.preventDefault();
//     axios({
//       method: "post",
//       url: BASE_URL + LOGIN_API,
//       data: data,
//     }).then(
//       (result) => {
//         if (result.status === 200) {
//           if (result.data.statusCode === 0) {
//             sessionStorage.setItem("sessionId", generateSessionId());
//             if (!result.data.userInfo.roleId) {
//               secureLocalStorage.setItem(
//                 sessionStorage.getItem("sessionId") + "userId",
//                 result.data.userInfo.id
//               );
//               secureLocalStorage.setItem(
//                 sessionStorage.getItem("sessionId") + "username",
//                 result.data.userInfo.username
//               );
//               secureLocalStorage.setItem(
//                 sessionStorage.getItem("sessionId") + "superAdmin",
//                 true
//               );
//               navigate(PRODUCT_ADMIN_HOME_PATH);
//             } else {
//               const currentPlanActive =
//                 result.data.userInfo.role.company.Subscription.some(
//                   (sub) => sub.planStatus
//                 );
//               if (currentPlanActive) {
//                 secureLocalStorage.setItem(
//                   sessionStorage.getItem("sessionId") + "employeeId",
//                   result.data.userInfo.employeeId
//                 );
//                 secureLocalStorage.setItem(
//                   sessionStorage.getItem("sessionId") + "userId",
//                   result.data.userInfo.id
//                 );
//                 secureLocalStorage.setItem(
//                   sessionStorage.getItem("sessionId") + "username",
//                   result.data.userInfo.username
//                 );
//                 secureLocalStorage.setItem(
//                   sessionStorage.getItem("sessionId") + "userEmail",
//                   result.data.userInfo.email
//                 );
//                 secureLocalStorage.setItem(
//                   sessionStorage.getItem("sessionId") + "userCompanyId",
//                   result.data.userInfo.role.companyId
//                 );
//                 secureLocalStorage.setItem(
//                   sessionStorage.getItem("sessionId") + "defaultAdmin",
//                   JSON.stringify(result.data.userInfo.role.defaultRole)
//                 );
//                 secureLocalStorage.setItem(
//                   sessionStorage.getItem("sessionId") + "userRoleId",
//                   result.data.userInfo.roleId
//                 );
//                 secureLocalStorage.setItem(
//                   sessionStorage.getItem("sessionId") +
//                   "latestActivePlanExpireDate",
//                   new Date(
//                     result.data.userInfo.role.company.Subscription[0].expireAt
//                   ).toDateString()
//                 );
//                 secureLocalStorage.setItem(
//                   sessionStorage.getItem("sessionId") + "userRole",
//                   result.data.userInfo.role.name
//                 );
//                 setIsGlobalOpen(true);
//               } else {
//                 const expireDate = new Date(
//                   result.data.userInfo.role.company.Subscription[0].expireAt
//                 );
//                 setPlanExpirationDate(expireDate.toDateString());
//               }
//             }
//           } else {
//             console.log(result.data, "result.data")
//             toast.warning(result.data.message);
//             setLoading(false);
//           }
//         }
//       },
//       (error) => {

//         toast.error("Server Down", { autoClose: 5000 });
//         setLoading(false);
//       }
//     );
//   };

//   return (
//     <>
//       <Modal
//         isOpen={isGlobalOpen}
//         onClose={() => {
//           setIsGlobalOpen(false);
//         }}
//         widthClass={""}
//       >
//         <BranchAndFinyearForm setIsGlobalOpen={setIsGlobalOpen} />
//       </Modal>

//       <div className="flex justify-around items-center bg-pink-300  h-screen">


//         <div className="w-96 h-96" >
//           <img className="rounded-xl w-full h-full" src={buildingLogo} />
//         </div>


//         <div>
//           <form
//             className="bg-gray-200 rounded-xl p-6 mb-4"
//             onSubmit={loginUser}
//           >
//             <div className="mb-4">
//               <label
//                 className="block text-blue-500 text-md font-bold mb-2"
//                 htmfor="username"
//               >
//                 Username
//               </label>
//               <input
//                 onChange={(e) => setUsername(e.target.value)}
//                 value={username}
//                 className="shadow bg-white appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
//                 id="username"
//                 type="text"
//                 placeholder="Username"
//                 required
//               />
//             </div>
//             <div className="mb-6">
//               <label
//                 className="block text-blue-500 text-md font-bold mb-2"
//                 htmfor="password"
//               >
//                 Password
//               </label>
//               <input
//                 onChange={(e) => setPassword(e.target.value)}
//                 value={password}
//                 className="shadow bg-white appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:shadow-outline"
//                 id="password"
//                 type="password"
//                 placeholder="******************"
//                 required
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <button
//                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                 type="submit"
//               >
//                 Sign In
//               </button>
//               <p className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-gray-700 ">
//                 Forgot Password?
//               </p>
//             </div>
//             <p className="mt-6 text-center text-blue-500 text-xs">
//               &copy;{new Date().getFullYear()} Pinnacle Systems All rights reserved.
//             </p>




//           </form>
//         </div>





//       </div>
//     </>
//   );
// };

// export default Login;

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from "react-secure-storage";
import axios from "axios";

import { LOGIN_API } from '../../../Api';
import { generateSessionId } from '../../../Utils/helper';
import Modal from '../../../UiComponents/Modal';
import BranchAndFinYearForm from '../../components/BranchAndFinyear';
import { PRODUCT_ADMIN_HOME_PATH } from '../../../Route/urlPaths';
import toast from 'react-hot-toast';


const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Login = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  // const [formData, setFormData] = useState({ email: email, password: password })
  const [errors, setErrors] = useState({});
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planExpirationDate, setPlanExpirationDate] = useState("");
  const navigate = useNavigate();

  // Validation function to check email and password
  const validate = () => {
    const errors = {};


    if (!username) {
      errors.email = "Email is required";
    }
    //  else if (
    //     !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    // ) {
    //     errors.email = "Invalid email address";
    // }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    }
    //  else if (password.length < 6) {
    //     errors.password = "Password must be at least 6 characters";
    // }

    return errors;
  };

  const data = { username, password }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validateErrors = validate()
    setErrors(validateErrors)
    if (Object.keys(validateErrors).length === 0) {
      axios({
        method: "post",
        url: BASE_URL + LOGIN_API,
        data: data,
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              sessionStorage.setItem("sessionId", generateSessionId());
              if (!result.data.userInfo.roleId) {
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "userId",
                  result.data.userInfo.id
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "username",
                  result.data.userInfo.username
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "superAdmin",
                  true
                );
                navigate(PRODUCT_ADMIN_HOME_PATH);
              } else {
                const currentPlanActive =
                  result.data.userInfo.role.company.Subscription.some(
                    (sub) => sub.planStatus
                  );
                if (currentPlanActive) {
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "employeeId",
                    result.data.userInfo.employeeId
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userId",
                    result.data.userInfo.id
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "username",
                    result.data.userInfo.username
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userEmail",
                    result.data.userInfo.email
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userCompanyId",
                    result.data.userInfo.role.companyId
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "defaultAdmin",
                    JSON.stringify(result.data.userInfo.role.defaultRole)
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userRoleId",
                    result.data.userInfo.roleId
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") +
                    "latestActivePlanExpireDate",
                    new Date(
                      result.data.userInfo.role.company.Subscription[0].expireAt
                    ).toDateString()
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userRole",
                    result.data.userInfo.role.name
                  );
                  setIsGlobalOpen(true);
                } else {
                  const expireDate = new Date(
                    result.data.userInfo.role.company.Subscription[0].expireAt
                  );
                  setPlanExpirationDate(expireDate.toDateString());
                }
              }
            } else {
              console.log(result)
              toast.error(result.data.message);
              setLoading(false);
            }
          }
          console.log("result", result.data.data);
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
          setLoading(false);
        }
      );
    };
  }


  return (
    <>
      <Modal
        isOpen={isGlobalOpen}
        onClose={() => {
          setIsGlobalOpen(false);
        }}
        widthClass={""}
      >
        <BranchAndFinYearForm setIsGlobalOpen={setIsGlobalOpen} />
      </Modal>
      <div className="flex flex-row w-screen h-screen bg-beige">
        {/* Left Section */}
        <div className="flex justify-center items-center w-1/2 bg-[--main-color]">
          <div>
            <div className="text-9xl font-bold ">erp</div>
            <p className="text-xl text-end">systems</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex justify-center items-center w-1/2">
          <div className="w-1/2 px-3 py-4 rounded-xl shadow-lg bg-white">
            <p className="font-semibold mb-1 text-center text-2xl">Welcome Back!</p>
            <p className="text-center text-gray-400">Please enter your details to sign in.</p>

            <form onSubmit={(e) => handleSubmit(e)}>
              {/* Username Field */}
              <div className="mb-3">
                <div className="border rounded-md">
                  <input className="p-2 w-full" placeholder="Enter your username..." type="text" name="username" value={username} id="username" onChange={(e) => setUsername(e.target.value)} />
                </div>
                {errors.username ? (<div className="text-red-500">{errors.username}</div>) : (<div className="text-sm">&nbsp;</div>)}
              </div>

              {/* Password Field */}
              <div className="mb-2">
                <div className="flex items-center border rounded-md relative">
                  <input className="p-2 w-80" placeholder="Password" type={showPassword ? "text" : "password"} name="password" value={password} id="password" onChange={(e) => setPassword(e.target.value)} />
                  <div className="absolute right-2 top-2.5 text-neutral-500">
                    {showPassword ? <EyeOff size={15} onClick={() => setShowPassword(false)} /> : <Eye size={15} onClick={() => setShowPassword(true)} />}
                  </div>
                </div>
                {errors.password ? (<div className="text-red-500">{errors.password}</div>) : (<div className="text-sm">&nbsp;</div>)}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="w-full mb-3 flex justify-between items-center px-1 text-xs">
                <div className="flex items-center">
                  <input type="checkbox" /> <span className="ml-1">Remember me</span>
                </div>
                <div className="underline cursor-pointer text-gray-500">Forgot password?</div>
              </div>

              {/* Login Button */}
              <button type="submit" className="w-full p-2 text-white bg-black rounded-lg">Login</button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-3 text-xs text-center">
              <p>Don{`'`}t have an account yet? <span onClick={() => navigate('/register')} className="text-blue-600 cursor-pointer">Sign Up</span></p>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default Login

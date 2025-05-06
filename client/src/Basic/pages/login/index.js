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

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import axios from "axios";

import { LOGIN_API } from "../../../Api";
import { generateSessionId } from "../../../Utils/helper";
import Modal from "../../../UiComponents/Modal";
import BranchAndFinYearForm from "../../components/BranchAndFinyear";
import { PRODUCT_ADMIN_HOME_PATH } from "../../../Route/urlPaths";
import toast from "react-hot-toast";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const data = { username, password };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validateErrors = validate();
    setErrors(validateErrors);
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
              console.log(result);
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
    }
  };

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
      <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e0e7ff] via-white to-[#f0f5ff] font-[Poppins] overflow-hidden"
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/id/1387073187/vector/orange-vector-cover-wallpaper.jpg?s=612x612&w=0&k=20&c=c-mVdVrioq3C4kcLxk4Y-bltcCUv3z0l5SzaaerfC-A=')",
        fontFamily: 'Poppins, sans-serif',
      }}
    >

{/* Central Glassmorphic Login Circle */}
<div className="z-10 w-[420px] h-[420px] rounded-full bg-white/20 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(31,38,135,0.37)] flex flex-col justify-center items-center text-center px-8 py-6">
  <h2 className="text-3xl font-bold mb-3 text-gray-800">Welcome Back</h2>
  <p className="text-gray-500 mb-6">Login to your dashboard</p>

  <form className="w-full space-y-4" onSubmit={(e) => handleSubmit(e)}>
    <input
      type="text"
      name="username"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="w-full px-4 py-2 bg-white/60 backdrop-blur-md border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
    {errors.username && <div className="text-sm text-red-500">{errors.username}</div>}

    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 bg-white/60 backdrop-blur-md border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <div className="absolute top-2.5 right-3 text-gray-500 cursor-pointer">
        {showPassword ? <EyeOff size={18} onClick={() => setShowPassword(false)} /> : <Eye size={18} onClick={() => setShowPassword(true)} />}
      </div>
    </div>
    {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}

    <button type="submit" className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all">
      Login
    </button>
  </form>

  <div className="mt-4 text-sm">
    Don’t have an account?{" "}
    <span onClick={() => navigate("/register")} className="text-indigo-600 underline cursor-pointer">Sign Up</span>
  </div>
</div>

{/* Orbiting Product Balls */}
{[
  { title: "GMS", desc: "ERP for Garments" },
  { title: "PMS", desc: "Payroll with App" },
  { title: "PCS", desc: "Spinning & Knitting" },
  { title: "POS", desc: "Retail POS" },
  { title: "Costing", desc: "Textile Costing" },
  { title: "Lab", desc: "LIMS Management" }
].map((product, i) => {
  const angle = (360 / 6) * i;
  return (
    <div
      key={i}
      className="absolute w-32 h-32 bg-white/30 rounded-full backdrop-blur-md border border-white/30 shadow-md flex flex-col justify-center items-center text-center text-sm p-2 hover:scale-110 transition-all"
      style={{
        transform: `rotate(${angle}deg) translate(260px) rotate(-${angle}deg)`
      }}
    >
      <div className="text-[#E77817] font-bold">{product.title}</div>
      <div className="text-gray-700 text-xs">{product.desc}</div>
    </div>
  );
})}
</div>

    </>
  );
};

export default Login;

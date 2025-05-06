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
import {  User, Lock } from 'react-feather';
import { motion } from 'framer-motion'
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
      <div className="relative flex items-center justify-center min-h-screen bg-gray-900 font-[Poppins] overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/80 via-gray-900 to-purple-900/80">
        <div
          className="absolute inset-0 animate-pulse-slow opacity-20"
          style={{
            background: `linear-gradient(45deg, 
              rgba(56, 189, 248, 0.2) 0%, 
              rgba(236, 72, 153, 0.2) 50%,
              rgba(245, 158, 11, 0.2) 100%)`,
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[size:40px_40px] bg-grid-white/5 opacity-20" />

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="z-10 w-[420px] rounded-xl bg-gray-800/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col justify-center items-center px-8 py-6 relative overflow-hidden neon-glow"
      >
        {/* Top Gradient Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        {/* Bottom Gradient Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />

        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-gray-400 mb-6">Access your digital workspace</p>

        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          {/* Username Field */}
          <motion.div whileHover={{ scale: 1.02 }} className="relative group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 backdrop-blur-md border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 placeholder-gray-400 text-gray-100"
            />
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {/* Password Field */}
          <motion.div className="relative group" whileHover={{ scale: 1.02 }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 bg-gray-700/50 backdrop-blur-md border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 placeholder-gray-400 text-gray-100"
            />
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <motion.div
              className="absolute top-3 right-3 text-gray-400 cursor-pointer hover:text-purple-400"
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </motion.div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {/* Authenticate Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-lg shadow-lg hover:shadow-cyan-400/50 transition-all duration-200 font-medium relative overflow-hidden group"
          >
            <span className="relative z-10">Authenticate</span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity" />
          </motion.button>
        </form>

        {/* Request Access */}
        <motion.div
          className="mt-4 text-sm text-gray-400 hover:text-purple-400 cursor-pointer transition-colors group"
          whileHover={{ scale: 1.05 }}
        >
          New user? <span className="font-semibold group-hover:underline">Request access</span>
        </motion.div>
      </motion.div>

      {/* Product Showcase */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
        <div className="relative w-[800px] h-[800px] orbit-ring">
          {[
            { title: 'GMS', desc: 'Garment ERP', icon: '👔', color: 'text-blue-400' },
            { title: 'PMS', desc: 'Payroll System', icon: '💰', color: 'text-green-400' },
            { title: 'PCS', desc: 'Production Control', icon: '🏭', color: 'text-purple-400' },
            { title: 'POS', desc: 'Retail POS', icon: '🛒', color: 'text-orange-400' },
            { title: 'Costing', desc: 'Textile Costing', icon: '🧮', color: 'text-pink-400' },
            { title: 'Lab', desc: 'LIMS', icon: '🔬', color: 'text-yellow-400' },
          ].map((product, i) => {
            const angle = (Math.PI * 2 * i) / 6;
            const radius = 320;
            return (
              <motion.div
                key={i}
                className="absolute w-48 h-48 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: Math.cos(angle) * radius,
                  y: Math.sin(angle) * radius,
                }}
                transition={{
                  type: 'spring',
                  delay: i * 0.1,
                  stiffness: 50,
                  damping: 10,
                }}
                whileHover={{
                  scale: 1.15,
                  transition: { duration: 0.3 },
                }}
              >
                <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center shadow-2xl transform hover:rotate-[5deg] transition-all duration-300">
                  <div className={`text-4xl mb-3 ${product.color}`}>{product.icon}</div>
                  <h3 className={`text-xl font-bold mb-1 ${product.color}`}>{product.title}</h3>
                  <p className="text-gray-300 text-sm">{product.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Animated Connections */}
      <svg className="absolute inset-0 pointer-events-none z-10">
        {[...Array(6)].map((_, i) => (
          <motion.path
            key={i}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: i * 0.2 }}
            className="stroke-white/5"
            d={`M 400 400 Q ${
              400 + Math.cos((Math.PI * 2 * i) / 6) * 200
            } ${400 + Math.sin((Math.PI * 2 * i) / 6) * 200} 400 400`}
            fill="none"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>

    </>
  );
};

export default Login;

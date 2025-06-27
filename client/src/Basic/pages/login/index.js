import { useState } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from "react-secure-storage";
import axios from "axios";
import { motion } from 'framer-motion';
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
  const products = [
    { title: 'GMS', desc: 'Garment ERP', icon: '👔', color: 'text-amber-500' },
    { title: 'PMS', desc: 'Payroll System', icon: '💰', color: 'text-orange-500' },
    { title: 'PCS', desc: 'Production Control', icon: '🏭', color: 'text-orange-600' },
    { title: 'POS', desc: 'Retail POS', icon: '🛒', color: 'text-amber-600' },
    { title: 'Costing', desc: 'Textile Costing', icon: '🧮', color: 'text-orange-700' },
    { title: 'Lab Testing', desc: 'LIMS', icon: '🔬', color: 'text-amber-700' },
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      <div
        style={{
          backgroundImage: "url('https://png.pngtree.com/thumb_back/fh260/background/20220428/pngtree-attractive-advertise-blank-banner-copyspace-vector-image_1102577.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center"
        }}
        className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 font-sans overflow-hidden"
      >

        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-100/40 to-transparent" />
          <div className="absolute inset-0 bg-grid-stone-900/5 opacity-15" />
        </div>

        {/* Floating Blobs */}
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-teal-400/15 blur-3xl -z-10"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl -z-10"
        />

        {/* Main Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="relative z-10 w-full max-w-md px-8 py-10 bg-white/95 backdrop-blur-lg rounded-2xl border border-stone-200 shadow-xl overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-teal-400/10 blur-md" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-rose-500/10 blur-md" />

          {/* Gradient Borders */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />

          {/* Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-1"
            >
              <label htmlFor="username" className="text-sm font-medium text-stone-700">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-teal-600" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/80 border border-stone-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-stone-400 text-stone-700 transition-all duration-200"
                  placeholder="Enter your username"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-1"
            >
              <label htmlFor="password" className="text-sm font-medium text-stone-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-teal-600" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-white/80 border border-stone-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-stone-400 text-stone-700 transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-stone-400 hover:text-stone-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-stone-400 hover:text-stone-600 transition-colors" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 rounded-lg font-medium text-white transition-all duration-300 ${isSubmitting
                    ? 'bg-teal-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md hover:shadow-teal-400/30'
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-sm text-stone-600"
          >
            <a href="#" className="font-medium text-teal-600 hover:text-teal-700 transition-colors">
              Forgot password?
            </a>
            <span className="mx-2 text-stone-400">•</span>
            <a href="#" className="font-medium text-rose-500 hover:text-rose-600 transition-colors">
              Create account
            </a>
          </motion.div>
        </motion.div>

        {/* Floating Product Cards */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
          {products.map((product, i) => {
            const angle = (Math.PI * 2 * i) / products.length;
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
                  scale: 1.1,
                  zIndex: 10,
                  transition: { duration: 0.3 },
                }}
              >
                <div className="bg-white/95 backdrop-blur-md border border-stone-200 rounded-full rounded-xl p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`text-4xl mb-3 ${product.color}`}>{product.icon}</div>
                  <h3 className="text-lg font-bold mb-1 text-stone-800">{product.title}</h3>
                  <p className="text-stone-600 text-xs">{product.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>


    </>
  )
}

export default Login

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaPhone, FaIdBadge, FaCalendar, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdWork, MdApartment, MdPassword } from 'react-icons/md';

const EmployeeForm = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  
  const onSubmit = data => console.log(data);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <MdWork className="text-blue-500" />
          Employee Registration
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-500" />
              Personal Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  Full Name
                </label>
                <input
                  {...register("fullName", { required: "Full name is required" })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaCalendar className="text-gray-400" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...register("dob", { required: "Date of birth is required" })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.dob ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                />
                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaEnvelope className="text-blue-500" />
              Contact Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaPhone className="text-gray-400" />
                  Phone Number
                </label>
                <input
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Invalid phone number"
                    }
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <MdApartment className="text-blue-500" />
              Employment Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaIdBadge className="text-gray-400" />
                  Employee ID
                </label>
                <input
                  {...register("employeeId", { required: "Employee ID is required" })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.employeeId ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                />
                {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <MdWork className="text-gray-400" />
                  Department
                </label>
                <select
                  {...register("department", { required: "Department is required" })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.department ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="hr">Human Resources</option>
                  <option value="it">Information Technology</option>
                  <option value="finance">Finance</option>
                </select>
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <MdPassword className="text-blue-500" />
              Login Credentials
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaLock className="text-gray-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters"
                      }
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                      errors.password ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-blue-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaLock className="text-gray-400" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register("confirmPassword", {
                    validate: value =>
                      value === watch('password') || "Passwords do not match"
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Register Employee
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
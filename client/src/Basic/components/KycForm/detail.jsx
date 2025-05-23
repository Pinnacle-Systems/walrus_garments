import { useState, useRef } from 'react';
import { 
  FaBuilding, FaIdCard, FaFileAlt, FaUser, 
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaUpload,
  FaCheckCircle, FaFingerprint, FaArrowRight, FaExclamationCircle
} from 'react-icons/fa';

const KYCForm = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    gstNumber: '',
    panNumber: '',
    aadharNumber: '',
    registrationNumber: '',
    ownerName: '',
    contactNumber: '',
    email: '',
    address: '',
    cityState: '',
    pincode: '',
    businessType: '',
    productCategories: '',
    documents: null
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'companyName', 'gstNumber', 'panNumber', 'aadharNumber',
      'ownerName', 'contactNumber', 'email', 'address', 'businessType'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // GST validation (simplified pattern)
    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST number format';
    }

    // PAN validation
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN number format';
    }

    // Aadhar validation
    if (formData.aadharNumber && !/^[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Invalid Aadhar number format';
    }

    // Phone validation
    if (formData.contactNumber && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Invalid phone number';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Document validation
    if (!formData.documents) {
      newErrors.documents = 'Please upload required documents';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'documents') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Add your submission logic here
    }
  };

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Business Verification
          </h1>
          <p className="text-gray-600 text-lg">Secure your garment business account with complete KYC verification</p>
          <div className="pt-4 flex justify-center">
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Progress Indicator */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" 
                  style={{ width: '75%' }}
                />
              </div>
              <span className="text-blue-600">75% Completed</span>
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all hover:shadow-xl">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FaBuilding className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Company Information</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="companyName"
                label="Company Name *"
                icon={FaIdCard}
              />
              <InputField
                name="gstNumber"
                label="GST Number *"
                icon={FaFileAlt}
                placeholder="22AAAAA0000A1Z5"
                pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
              />
              <InputField
                name="panNumber"
                label="PAN Number *"
                icon={FaFileAlt}
                pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
              />
              <InputField
                name="aadharNumber"
                label="Aadhar Number *"
                icon={FaIdCard}
                pattern="^[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}$"
              />
              <InputField
                name="registrationNumber"
                label="Registration Number"
                icon={FaFileAlt}
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all hover:shadow-xl">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FaUser className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Contact Details</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="ownerName"
                label="Owner/Director Name *"
                icon={FaUser}
              />
              <InputField
                name="contactNumber"
                label="Contact Number *"
                icon={FaPhone}
                type="tel"
                pattern="^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$"
              />
              <InputField
                name="email"
                label="Email *"
                icon={FaEnvelope}
                type="email"
              />
              <InputField
                name="address"
                label="Address *"
                icon={FaMapMarkerAlt}
              />
              <InputField
                name="cityState"
                label="City/State"
                icon={FaMapMarkerAlt}
              />
              <InputField
                name="pincode"
                label="Pincode"
                icon={FaMapMarkerAlt}
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all hover:shadow-xl">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FaBuilding className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Business Details</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className={`peer h-12 w-full border-b-2 bg-transparent pt-4 pb-1.5 text-gray-900 outline-none transition-all ${
                    errors.businessType ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select business type</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Exporter">Exporter</option>
                  <option value="Importer">Importer</option>
                </select>
                <label className={`absolute left-0 -top-1 text-sm transition-all ${
                  errors.businessType ? 'text-red-600' : 'text-gray-500'
                } peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-1 peer-focus:text-sm`}>
                  Business Type *
                </label>
                <FaBuilding className={`h-5 w-5 absolute right-0 top-4 ${
                  errors.businessType ? 'text-red-500' : 'text-gray-400'
                }`} />
                {errors.businessType && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle className="flex-shrink-0" /> {errors.businessType}
                  </p>
                )}
              </div>
              <InputField
                name="productCategories"
                label="Product Categories"
                icon={FaFileAlt}
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FaUpload className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Upload Documents</h2>
              </div>
            </div>
            <div className="p-6">
              <label
                htmlFor="document-upload"
                className={`group relative flex flex-col items-center justify-center h-48 rounded-xl border-3 border-dashed transition-all ${
                  errors.documents 
                    ? 'border-red-500 bg-red-50 hover:border-red-600' 
                    : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="inline-flex p-4 bg-white rounded-full shadow-md group-hover:shadow-lg transition">
                    <FaUpload className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Drag & drop files or{' '}
                      <span className="text-blue-600 group-hover:text-blue-700 cursor-pointer">browse</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Supports: PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>
                <input
                  type="file"
                  id="document-upload"
                  name="documents"
                  ref={fileInputRef}
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
              
              {formData.documents && (
                <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{formData.documents.name}</p>
                      <p className="text-sm text-gray-500">
                        {(formData.documents.size / 1024).toFixed(1)}KB
                      </p>
                    </div>
                  </div>
                  <FaCheckCircle className="h-5 w-5 text-green-600" />
                </div>
              )}
              {errors.documents && (
                <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
                  <FaExclamationCircle className="h-5 w-5" />
                  <p>{errors.documents}</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-4 z-10">
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <FaFingerprint className="h-5 w-5" />
              Submit Verification
              <FaArrowRight className="h-4 w-4 ml-2 -mr-1" />
            </button>
          </div>
        </form>
      </div>

      {/* Animated Background Elements */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
      </div>
    </div>
  );
};

export default KYCForm;
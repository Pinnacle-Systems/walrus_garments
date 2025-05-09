import React, { useState } from 'react';
import { 
  FaBuilding, 
  FaIdCard, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaUser,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUpload
} from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';

const EnhancedKycForm = () => {
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.gstNumber) newErrors.gstNumber = 'GST number is required';
    if (!formData.panNumber) newErrors.panNumber = 'PAN number is required';
    if (!formData.aadharNumber) newErrors.aadharNumber = 'Aadhar number is required';
    if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    if (!formData.documents) newErrors.documents = 'Document upload is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-8 text-center">
          <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">KYC Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for submitting your KYC details. Our team will review your information and get back to you shortly.</p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Edit Information
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">KYC Verification</h1>
          <p className="text-gray-600 mt-2">Complete your Know Your Customer (KYC) details for garment & accessories business</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Details */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <FaBuilding className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Company Details</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg pl-10 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter company name"
                  />
                  <FaIdCard className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg pl-10 ${errors.gstNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="22AAAAA0000A1Z5"
                  />
                  <FaFileAlt className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                {errors.gstNumber && <p className="mt-1 text-sm text-red-600">{errors.gstNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg pl-10 ${errors.panNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="AAAAA0000A"
                  />
                  <FaFileAlt className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                {errors.panNumber && <p className="mt-1 text-sm text-red-600">{errors.panNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg pl-10 ${errors.aadharNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="1234 5678 9012"
                  />
                  <FaIdCard className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                {errors.aadharNumber && <p className="mt-1 text-sm text-red-600">{errors.aadharNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg pl-10"
                    placeholder="Company registration number"
                  />
                  <FaFileAlt className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <FaUser className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Contact Details</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner/Director Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg pl-10 ${errors.ownerName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter full name"
                  />
                  <FaUser className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg pl-10 ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+91 9876543210"
                  />
                  <FaPhone className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg pl-10 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="your@email.com"
                  />
                  <FaEnvelope className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg pl-10 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Street address"
                  />
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City/State</label>
                <div className="relative">
                  <input
                    type="text"
                    name="cityState"
                    value={formData.cityState}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg pl-10"
                    placeholder="City and state"
                  />
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <div className="relative">
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg pl-10"
                    placeholder="Postal code"
                  />
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <FaBuilding className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Business Details</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
                <div className="relative">
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg pl-10 pr-8 appearance-none ${errors.businessType ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select business type</option>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Exporter">Exporter</option>
                    <option value="Importer">Importer</option>
                  </select>
                  <FaBuilding className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  <FiChevronDown className="h-5 w-5 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
                {errors.businessType && <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Categories</label>
                <div className="relative">
                  <input
                    type="text"
                    name="productCategories"
                    value={formData.productCategories}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg pl-10"
                    placeholder="e.g., T-shirts, Jeans, Accessories"
                  />
                  <FaFileAlt className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <FaFileAlt className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Document Upload</h2>
              </div>
            </div>
            <div className="p-6">
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${errors.documents ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex flex-col items-center justify-center">
                  <FaUpload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mb-4">PDF, JPG, PNG up to 5MB</p>
                  <input
                    type="file"
                    name="documents"
                    onChange={handleChange}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer flex items-center"
                  >
                    <FaUpload className="mr-2" />
                    Select Files
                  </label>
                </div>
                {formData.documents && (
                  <div className="mt-4 flex items-center justify-center text-green-600">
                    <FaCheckCircle className="h-5 w-5 mr-2" />
                    <span>{formData.documents.name}</span>
                  </div>
                )}
                {errors.documents && (
                  <div className="mt-4 flex items-center justify-center text-red-600">
                    <FaTimesCircle className="h-5 w-5 mr-2" />
                    <span>{errors.documents}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <p>Upload any of the following documents: GST certificate, PAN card, Aadhar card, Business registration certificate</p>
              </div>
            </div>
          </div>

          {/* Form Submission */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md flex items-center"
            >
              <FaCheckCircle className="mr-2" />
              Submit KYC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedKycForm;
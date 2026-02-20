import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const FileUpload = () => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center p-4">
      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[30px] shadow-2xl shadow-blue-100 overflow-hidden p-12 flex flex-col items-center"
      >
        
        {/* Top Icon */}
        <div className="bg-blue-500 p-4 rounded-2xl shadow-lg shadow-blue-200 mb-6">
          <Upload className="text-white w-8 h-8" />
        </div>

        {/* Header Text */}
        <h1 className="text-4xl font-bold text-[#4D5EF6] mb-2">CSV File Upload</h1>
        <p className="text-gray-500 text-lg mb-10">Upload your CSV file to get started</p>

        {/* Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          className={`w-full border-2 border-dashed rounded-[20px] p-16 flex flex-col items-center justify-center transition-all ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-transparent"
          }`}
        >
          <div className="bg-gray-100 p-5 rounded-full mb-6">
            <FileText className="text-gray-400 w-10 h-10" />
          </div>

          <p className="text-xl font-semibold text-slate-700 mb-2">
            Drag & drop your CSV file here
          </p>
          
          <p className="text-gray-400 mb-6 font-medium text-lg">or</p>

          <input type="file" id="file-upload" className="hidden" accept=".csv" />
          <label 
            htmlFor="file-upload"
            className="bg-gradient-to-r from-[#4466FF] to-[#6044FF] text-white px-10 py-3 rounded-xl font-bold text-lg cursor-pointer shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-transform"
          >
            Browse Files
          </label>
        </div>

        <p className="mt-8 text-gray-400 text-sm font-medium">
          Supported format: CSV files only
        </p>
      </motion.div>
    </div>
  );
};

export default FileUpload;